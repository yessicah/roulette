# 🎡 Rueda de Citas

Una ruleta de actividades para planear citas con esa persona especial. Girás la rueda, cae en una actividad y listo: plan decidido.

## Archivos

- `index.html` – la página.
- `styles.css` – el diseño (estética de boletería de carnaval).
- `script.js` – la lógica de la rueda y de la lista de actividades.
- `activities.json` – **la "base de datos"**: la lista original de actividades que se carga la primera vez que alguien abre la página.

## Cómo funciona la "base de datos"

`activities.json` es un archivo de texto simple con un listado de actividades:

```json
[
  "Cine bajo las estrellas",
  "Picnic al atardecer"
]
```

- La **primera vez** que se abre la página en un navegador, se cargan las actividades desde `activities.json`.
- A partir de ahí, cada vez que agregás o quitás una actividad desde la página, el cambio se guarda en el `localStorage` de ese navegador (es decir, queda guardado en ese dispositivo/navegador, no en el archivo del repositorio).
- Botón **"Restablecer lista original"**: vuelve a cargar la lista tal cual está en `activities.json`, descartando los cambios guardados en ese navegador.
- Botón **"Exportar lista (JSON)"**: descarga un archivo `activities.json` con la lista actual. Si querés que la lista "de fábrica" cambie para todos (por ejemplo, para que tu pareja también la vea así al entrar por primera vez), descargá este archivo y reemplazá el `activities.json` del repositorio con este, luego hacé commit y push.

En resumen: `activities.json` es la base de datos compartida (vive en GitHub), y `localStorage` es el guardado rápido de cada navegador mientras juegan.

## Cómo alojarlo en GitHub Pages

1. Creá un repositorio nuevo en GitHub (puede ser público o privado, aunque para GitHub Pages gratuito en cuentas personales normalmente tiene que ser público, salvo que tengas GitHub Pro/Team).
2. Subí estos 5 archivos (`index.html`, `styles.css`, `script.js`, `activities.json`, `README.md`) a la raíz del repositorio.
3. Andá a **Settings → Pages** dentro del repositorio.
4. En "Source" (o "Build and deployment"), elegí la rama `main` y la carpeta `/ (root)`.
5. Guardá. GitHub te va a dar una URL parecida a:
   `https://tu-usuario.github.io/nombre-del-repositorio/`
6. Esperá uno o dos minutos y entrá a esa URL: ahí ya está la ruleta funcionando.

## Cómo editar las actividades desde el repositorio

Si preferís editar la lista "de fábrica" directamente en GitHub (sin pasar por la página):

1. Abrí `activities.json` en GitHub.
2. Tocá el ícono de lápiz para editar.
3. Agregá o quitá líneas, respetando el formato de lista JSON (cada actividad entre comillas, separada por comas).
4. Hacé commit de los cambios.

Ojo: si alguien ya usó la página antes en su navegador, su lista quedó guardada en `localStorage` y no va a ver el cambio automáticamente hasta que toque "Restablecer lista original".

## Personalización rápida

- Colores y tipografías: todo está definido como variables al principio de `styles.css` (`:root { ... }`).
- Cantidad de vueltas del giro, colores de los sectores de la rueda: al principio de `script.js` (`SEGMENT_COLORS`).
