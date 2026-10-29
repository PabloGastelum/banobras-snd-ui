#!/usr/bin/env bash
# Comprueba que @banobras/uki se puede consumir como paquete npm desde aplicaciones Angular 20 y 22 recién creadas.
# Empaqueta dist/uki, crea cada aplicación en un directorio temporal, instala el .tgz, agrega uki.css a "styles",
# usa los cuatro componentes y compila. Uso: npm run verify:consumo [-- 20.3.42 22.2.5]
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
VERSIONES=("$@")
[ ${#VERSIONES[@]} -eq 0 ] && VERSIONES=(20.3.42 22.2.5)
TMP="$(mktemp -d "${TMPDIR:-/tmp}/uki-consumo.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

echo "› Compilando la librería"
(cd "$RAIZ" && npx ng build uki >/dev/null)
TGZ="$(cd "$RAIZ/dist/uki" && npm pack --pack-destination "$TMP" --silent)"
echo "› Paquete: $TGZ ($(du -h "$TMP/$TGZ" | cut -f1))"

for VERSION in "${VERSIONES[@]}"; do
  APP="$TMP/app-$VERSION"
  echo "› Angular $VERSION: creando aplicación"
  (cd "$TMP" && npx -y "@angular/cli@$VERSION" new "app-$VERSION" --defaults --skip-git --ssr=false --style=css >/dev/null)
  (cd "$APP" && npm install --no-audit --no-fund "$TMP/$TGZ" >/dev/null)

  node - "$APP" <<'EOF'
const fs = require('node:fs');
const path = require('node:path');
const app = process.argv[2];
const config = JSON.parse(fs.readFileSync(path.join(app, 'angular.json'), 'utf8'));
const proyecto = Object.values(config.projects)[0];
proyecto.architect.build.options.styles = ['node_modules/@banobras/uki/styles/uki.css', ...proyecto.architect.build.options.styles];
fs.writeFileSync(path.join(app, 'angular.json'), JSON.stringify(config, null, 2));
fs.writeFileSync(
  path.join(app, 'src/app/app.ts'),
  `import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UkiButton, UkiButtonGroup, UkiCheckbox, UkiSpinner } from '@banobras/uki';

@Component({
  selector: 'app-root',
  imports: [UkiButton, UkiButtonGroup, UkiCheckbox, UkiSpinner, ReactiveFormsModule],
  template: \`
    <div ukiButtonGroup>
      <button ukiButton variant="ghost" type="button">Cancelar</button>
      <button ukiButton type="button" [loading]="guardando()">Guardar</button>
    </div>
    <uki-checkbox [formControl]="acepta">Acepto</uki-checkbox>
    <uki-spinner size="36" />
  \`,
})
export class App {
  readonly guardando = signal(false);
  readonly acepta = new FormControl(false, { nonNullable: true });
}
`,
);
EOF

  echo "› Angular $VERSION: ng build"
  (cd "$APP" && npx ng build 2>&1 | tee "$TMP/build-$VERSION.log" | tail -4)
  test -f "$APP/dist/app-$VERSION/browser/index.html"
  FUENTES="$(find "$APP/dist/app-$VERSION/browser" -name '*.woff2' -o -name '*.otf' | wc -l | tr -d ' ')"
  echo "› Angular $VERSION: $(cd "$APP" && node -p "require('@angular/core/package.json').version") compiló; fuentes copiadas: $FUENTES"
  test "$FUENTES" -ge 5
  if grep -qiE 'warning|advertencia' "$TMP/build-$VERSION.log"; then
    echo "  Advertencias del build:" && grep -iE 'warning' "$TMP/build-$VERSION.log"
  fi
done

echo "✔ Consumo verificado en: ${VERSIONES[*]}"
