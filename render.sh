name: Create Game Video

on:
  workflow_dispatch:
    inputs:
      game_url:
        description: "GamexlabTR oyun sayfası URL'si"
        required: true
        type: string
      game_title:
        description: "Videoda görünecek oyun adı"
        required: true
        default: "New HTML5 Game"
        type: string
      record_seconds:
        description: "Oynanış kayıt süresi (8-30)"
        required: true
        default: "15"
        type: string

permissions:
  contents: read

jobs:
  create-video:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    env:
      GAME_URL: ${{ inputs.game_url }}
      GAME_TITLE: ${{ inputs.game_title }}
      RECORD_SECONDS: ${{ inputs.record_seconds }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci || npm install

      - name: Install Chromium
        run: npx playwright install --with-deps chromium

      - name: Verify FFmpeg
        run: ffmpeg -version

      - name: Capture gameplay
        run: npm run capture

      - name: Render vertical social video
        run: npm run render

      - name: Upload video artifact
        uses: actions/upload-artifact@v4
        with:
          name: gamexlabtr-video
          path: |
            output/gamexlabtr-final.mp4
            output/cover.png
            output/metadata.json
          if-no-files-found: error
          retention-days: 7
