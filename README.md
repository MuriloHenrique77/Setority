# Sistema de Controle de Estoque por Setores

Aplicativo mobile com React Native, Expo SDK 54 e TypeScript.

O MVP possui Firebase Authentication, onboarding de estabelecimento e CRUD
de setores/produtos no Firestore, com React Navigation. O cadastro cria
atomicamente a entrada inicial quando a quantidade é positiva. Permite registrar,
editar e excluir entradas/saídas, consultar o histórico e abrir **Relatórios** pela
tela de Setores. Os relatórios oferecem filtros de período, setor, produto e tipo,
totais, rankings, produtos sem movimentação e reposição atual. Não utiliza
AsyncStorage como persistência. Dados do protótipo local não são migrados.

Para executar:

```sh
npm ci
npm start
```

Pré-requisitos: Node/npm compatíveis com Expo SDK 54, Android Studio/SDK, JDK e
`adb` configurados para compilar e executar. O teste dos Firebase Emulators exige
Java 21. A configuração cliente `google-services.json` já está associada ao projeto
`controle-de-estoque---tcc`, package `com.murilo.estoqueporsetores`; não contém
credencial administrativa. Não adicionar contas de serviço ou segredos ao cliente.

Use a development build instalada no Android, com `npm start`, ou
`npm run android` para compilar no ambiente Android configurado. React Native
Firebase exige development build; Expo Go não é compatível. A versão web
permanece com aviso de indisponibilidade de Firebase nativo. iOS está parcialmente
preparado, sem registro/configuração Firebase e sem build validado. Android é a
plataforma validada, em emulador; não foi validado dispositivo físico.

Validações locais:

```powershell
npx.cmd tsc --noEmit
npx.cmd expo-doctor
node --test tests/auth.test.cjs tests/recuperacao-senha.test.cjs tests/setores.test.cjs tests/produtos.test.cjs tests/relatorios.test.cjs tests/listeners.test.cjs tests/navigation.test.cjs
npx.cmd --yes firebase-tools emulators:exec --project demo-estoque-local --only auth,firestore "node --test tests/firebase-rules.test.cjs"
git diff --check
```

Consulte [docs/ARQUITETURA.md](docs/ARQUITETURA.md)
para o protocolo do contador de produtos, isolamento, offline e limite de cascade
(seis movimentações por produto). A consulta de relatórios exige o índice composto
de `firestore.indexes.json`, publicado no projeto `controle-de-estoque---tcc`.

Entrada, saída, edição e exclusão de movimentações exigem servidor online; não
existe fila de estoque offline. Sessão já validada pode consultar cache; após
reiniciar offline, o acesso aguarda confirmação de perfil/estabelecimento no servidor.
Confirmação de sucesso nunca representa apenas escrita local pendente.

Consulte [docs/AUDITORIA_FINAL_MVP.md](docs/AUDITORIA_FINAL_MVP.md) para a matriz
de requisitos, execução Android, segurança, limites e avaliação das dependências.
Não executar `npm audit fix` ou atualizar pacotes sem avaliação separada.

O Login oferece recuperação de senha pelo Firebase Authentication nativo, com
mensagem genérica de sucesso e solicitação de e-mail em português. Consulte
[docs/VALIDACAO_RECUPERACAO_SENHA.md](docs/VALIDACAO_RECUPERACAO_SENHA.md).
