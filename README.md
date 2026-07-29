# Chris Franz Design – Model-Release

Mobile, statische Model-Release-App für GitHub Pages. Sie benötigt keinen Server und speichert keine eingegebenen Modeldaten oder Unterschriften online. Die Daten werden ausschließlich im Browser verarbeitet und beim Bestätigen als PDF auf dem Gerät gespeichert.

## Auf GitHub veröffentlichen

1. Auf GitHub ein neues, leeres Repository anlegen, zum Beispiel `model-release`.
2. Den Inhalt dieses Ordners in das Repository hochladen und in den Branch `main` übertragen.
3. Im Repository **Settings → Pages** öffnen.
4. Unter **Build and deployment → Source** den Eintrag **GitHub Actions** auswählen.
5. Den Reiter **Actions** öffnen und warten, bis „GitHub Pages veröffentlichen“ erfolgreich abgeschlossen ist.
6. Der öffentliche Link steht danach unter **Settings → Pages**.

Jede spätere Änderung im Branch `main` wird automatisch neu veröffentlicht.

## Lokal testen

```powershell
pnpm install
pnpm dev
```

## Datenschutz

GitHub Pages stellt nur die leere Web-App und das Logo bereit. Formulareingaben und Unterschriften werden nicht an GitHub übertragen. Sie bleiben im Browser und werden nur in die heruntergeladene PDF geschrieben.
