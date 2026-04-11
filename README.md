# ArenaSoundRelease

Página estática para publicar os downloads do Arena Sound via GitHub Pages.

## Estrutura

- `index.html`: mesma landing page do `download.html`, mas preparada para GitHub Pages.
- `styles.css`: folha de estilos extraida do HTML.
- `app.js`: atualiza os botoes para os assets da release mais recente.

## Como publicar no GitHub Pages

1. Crie um repositório separado chamado `ArenaSoundRelease`.
2. Copie o conteúdo desta pasta para a raiz do novo repositório.
3. Faça push para a branch principal.
4. Em `Settings > Pages`, publique a partir de `Deploy from a branch` usando a branch principal e a pasta `/root`.

## Ajustes necessários

Se o repositório mudar de nome ou dono, edite as constantes no início de `app.js`:

- `repoOwner`
- `repoName`

## Convenção de arquivos esperada

O script tenta localizar automaticamente estes tipos de asset na última release:

- Windows: `.exe`
- macOS: `.dmg`
- Linux: `.AppImage`

Se algum asset não existir, o botão continua apontando para a página da release mais recente.