# Build APK release — Setority

Data da validação: 08/10/2026.

## Build e assinatura

- Método: EAS Build, perfil `production`, `android.buildType: apk`.
- Projeto EAS: `@murilohenrique/Controle-de-Fluxo`.
- Build: `d55c9532-0568-4473-adae-a5772c43ab73`, estado `FINISHED`, tarefa `:app:assembleRelease`.
- Versão: `1.0.0`; versionCode: `1`.
- Package: `com.murilo.estoqueporsetores`; nome nativo: `Setority`.
- Android mínimo: API 24; target: API 36.
- Arquiteturas: arm64-v8a, armeabi-v7a, x86 e x86_64.
- Credenciais de produção criadas e gerenciadas pelo fluxo oficial do EAS. Nenhuma senha ou keystore foi salva no projeto.
- `apksigner verify`: PASS, assinatura v2, um signatário RSA de 2048 bits.
- SHA-256 do certificado público: `02262f7e6606576ba250c9acf16425ae34749d141502000adc62c5729b796016`.
- APK sem flag `DEBUGGABLE`, com bundle `assets/index.android.bundle` incorporado. Execução sem Metro.
- A configuração local gerada de Gradle permanece com assinatura de debug; para reproduzir a entrega oficial, usar o perfil EAS `production` com credenciais remotas.

## Arquivo final

- Origem: https://expo.dev/artifacts/eas/Jp6_WuXY6LxzsVaRkKu12nFjYMgthJenCKS0GbSCM6U.apk
- Download original: `%TEMP%/setority-release-d55c9532/app-release.apk`.
- Cópia final: `release/Setority-v1.0.0.apk`.
- Tamanho: 113.530.423 bytes (113,53 MB; aproximadamente 108,27 MiB).
- SHA-256: `607afd095119335258a714b8fe0c4ea2c63d2645e9aa2f14c55b56bf64549c11`.
- Hashes do download e da cópia final idênticos. APK não foi recomprimido ou modificado.

## Validações

- TypeScript: PASS.
- Testes de lógica/serviços/UI: 100/100 PASS.
- Firestore Security Rules em emuladores locais: 500/500 PASS, executados na inspeção pré-build anterior à autenticação EAS; fonte preservada.
- Expo Doctor: 18/18 PASS.
- `git diff --check`: PASS.
- Identidade visual: assets oficiais preservados, sem alteração de bytes.

## Android

PASS no Pixel_6_API_36, com janela visível no canto direito do monitor principal, conexão `device` e boot concluído.

O mesmo APK final foi instalado. A atualização sobre o app debug foi recusada por assinatura incompatível; somente essa instalação de teste no emulador foi removida para permitir a instalação release.

Validados em 360 × 740: nome e ícone no launcher, splash Android com símbolo oficial centralizado, Welcome deslogada, Login, Cadastro, onboarding mínimo, acesso ao Firebase, resumo de estoque, abas Estoque/Movimentações/Relatórios, logout para Welcome, login e preservação do estabelecimento, reinício com sessão preservada e logout final. Nenhum erro crítico encontrado no processo.

Perfil, estabelecimento vazio e conta Auth sintéticos foram removidos após validação; credenciais temporárias apagadas. Resolução 1080 × 2400, densidade 420 e configuração original de teclado foram restauradas. Emulador permanece aberto e visível com o release instalado.

Evidências em `docs/validacoes/release-setority-*.png`.

## Envio por e-mail

Não enviado. Destinatário autorizado: `m.henriquelg@gmail.com`. O conector oficial Gmail está autenticado na conta do destinatário, mas:

- Gmail bloqueia anexos `.apk`: https://support.google.com/mail/answer/6590?hl=pt-BR
- O arquivo de 113,53 MB excede o limite de 25 MB para contas pessoais: https://support.google.com/mail/answer/6584?hl=pt-BR

Nenhuma tentativa de contornar os limites, renomear/recomprimir o APK ou fazer upload para outro serviço foi realizada. Não há confirmação de envio ou ID de mensagem Gmail.

## Alterações desta entrega

- `app.json`: vínculo do projeto EAS e owner, preservando identidade, versões, package e Firebase.
- `eas.json`: perfil APK de produção, credenciais remotas e versão local sem incremento automático.
- Este relatório e evidências visuais.

Sem commit, publicação em loja ou alteração funcional.

Resultado: APK RELEASE ASSINADO E VALIDADO; ENVIO POR E-MAIL COM PENDÊNCIA DO GMAIL.
