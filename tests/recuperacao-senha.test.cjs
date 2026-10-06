const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,imports={}){
 const m={exports:{}},code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(name=>{if(name in imports)return imports[name];throw Error('Import inesperado: '+name);},m,m.exports);return m.exports;
}
const utils=load('src/utils/auth.ts');
test('recuperação: email obrigatório, trim e formato básico sem espaços internos',()=>{
 for(const email of ['', '  ','a','a@','a@exemplo','a b@exemplo.com','a@exemplo .com'])assert.ok(utils.validarEmailRecuperacao(email));
 assert.equal(utils.validarEmailRecuperacao('  pessoa+estoque@exemplo.com.br  '),null);
 assert.equal(utils.validarEmailRecuperacao(' '),'Informe seu e-mail.');
});
test('recuperação: erros traduzidos sem código técnico ou detalhes da conta',()=>{
 const expected={
  'auth/invalid-email':'Informe um e-mail válido.',
  'auth/network-request-failed':'Verifique sua conexão e tente novamente.',
  'auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente novamente.',
 };
 for(const [code,message]of Object.entries(expected))assert.equal(utils.mensagemErroRecuperacao({code}),message);
 for(const code of ['auth/internal-error','auth/operation-not-allowed','auth/app-not-authorized','app/web-unavailable'])assert.match(utils.mensagemErroRecuperacao({code}),/indisponível/);
 for(const error of [new Error('FirebaseError técnico'),null,{code:'auth/user-disabled'},{code:'auth/desconhecido'}])assert.equal(utils.mensagemErroRecuperacao(error),'Não foi possível enviar as instruções. Tente novamente mais tarde.');
 assert.equal(utils.mensagemRecuperacaoEnviada,'Se existir uma conta com este e-mail, enviaremos instruções para redefinir sua senha.');
});
function service(failure){const calls=[],auth={};const s=load('src/services/firebase/session.ts',{
 '@react-native-firebase/auth':{setLanguageCode:async(a,lang)=>calls.push(['idioma',a,lang]),sendPasswordResetEmail:async(a,email)=>{calls.push(['enviar',a,email]);if(failure)throw failure;}},
 '@react-native-firebase/firestore':{},'./auth':{obterAuth:()=>auth},'./firestore':{},'./collections':{},'./converters/onboarding':{},'../../utils/auth':utils,
 });return {...s,calls,auth};}
test('serviço nativo usa pt antes do envio, normaliza email e não opera Firestore',async()=>{
 const s=service();await s.recuperarSenha('  pessoa@exemplo.test  ');assert.deepEqual(s.calls,[['idioma',s.auth,'pt'],['enviar',s.auth,'pessoa@exemplo.test']]);
 const invalid=service();await assert.rejects(()=>invalid.recuperarSenha(' '),/Informe seu e-mail/);assert.equal(invalid.calls.length,0);
});
test('conta inexistente preserva sucesso genérico; demais erros são propagados para tradução',async()=>{
 await service({code:'auth/user-not-found'}).recuperarSenha('ausente@exemplo.test');
 for(const code of ['auth/network-request-failed','auth/too-many-requests','auth/internal-error'])await assert.rejects(()=>service({code}).recuperarSenha('pessoa@exemplo.test'),e=>e.code===code);
});
test('tela bloqueia duplo submit, exibe loading, não atualiza após unmount e permite retry em erro',async()=>{
 let cursor=0,cleanup,pending,requests=0,back=0;const states=[],refs=[];
 const react={useState:v=>{const i=cursor++;if(!(i in states))states[i]=v;return[states[i],x=>states[i]=x];},useRef:v=>{const i=cursor++;return refs[i]??=( {current:v} );},useEffect:fn=>{if(!cleanup)cleanup=fn();}};
 const components={AuthFormLayout:'layout',FormButton:'button',authStyles:{}};
 const screen=load('src/screens/auth/RecuperarSenhaScreen.tsx',{
  react:{...react,default:react},'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
  'react-native':{Text:'text',TextInput:'input',ActivityIndicator:'spinner'},'../../components/AuthFormLayout':components,
  '../../utils/auth':utils,'../../services/firebase/session':{firebaseNativoDisponivel:true,recuperarSenha:()=>{requests++;return new Promise((resolve,reject)=>pending={resolve,reject});}},
 }).default;
 const render=()=>{cursor=0;return screen({navigation:{goBack:()=>back++}});};
 function nodes(tree){return tree&&typeof tree==='object'?[tree,...[tree.props?.children].flat(Infinity).flatMap(nodes)]:[];}
 let tree=render();nodes(tree).find(n=>n.type==='input').props.onChangeText('pessoa@exemplo.test');tree=render();
 const submit=nodes(tree).find(n=>n.props.label==='Enviar instruções').props.onPress;submit();submit();assert.equal(requests,1);
 tree=render();assert.equal(nodes(tree).find(n=>n.props.label==='Enviando...').props.disabled,true);assert.equal(nodes(tree).find(n=>n.type==='input').props.editable,false);assert.ok(nodes(tree).some(n=>n.type==='spinner'));
 pending.reject({code:'auth/network-request-failed'});await new Promise(r=>setImmediate(r));tree=render();assert.equal(tree.props.erro,'Verifique sua conexão e tente novamente.');
 nodes(tree).find(n=>n.props.label==='Enviar instruções').props.onPress();assert.equal(requests,2);pending.resolve();await new Promise(r=>setImmediate(r));tree=render();assert.ok(nodes(tree).some(n=>n.props.children===utils.mensagemRecuperacaoEnviada));assert.ok(!nodes(tree).some(n=>n.type==='input'));
 nodes(tree).find(n=>n.props.label==='Voltar ao Login').props.onPress();assert.equal(back,1);
 // Retorno de uma solicitação em tela desmontada não muda o estado.
 states[3]=false;tree=render();nodes(tree).find(n=>n.props.label==='Enviar instruções').props.onPress();cleanup();const before=[...states];pending.resolve();await new Promise(r=>setImmediate(r));assert.deepEqual(states,before);
});
