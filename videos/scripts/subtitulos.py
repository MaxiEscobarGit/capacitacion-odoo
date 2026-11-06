"""Genera los subtítulos (WebVTT) de los videos de los Bloques 2, 3 y 4.

El texto viene de transcribir las narraciones con whisper.cpp y corregirlo a mano.
Bloques 2 y 4: el texto está ordenado en tramos de 8 s (la voz es continua, sin pausas),
y dentro de cada tramo se reparte en proporción a la cantidad de letras.
Bloque 3: la voz tiene pausas, así que se usan los tiempos de cada frase.
En los videos editados la voz arranca 0,5 s después, por eso OFFSET.

Uso: python3 videos/scripts/subtitulos.py  (escribe media/bloqueN/subtitulos.vtt)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OFFSET = 0.5
MAX_CHARS = 84  # ~2 renglones

B2 = (84.8, [
    "En este bloque vemos cómo controlar el stock. Desde Ventas hacemos clic en Nuevo para empezar una cotización. El cliente queda",
    "como Consumidor Final. Ahora buscamos el primer producto por su código. Odoo nos va a mostrar una advertencia del producto,",
    "la vamos a leer y la vamos a cerrar. En cantidad vamos a colocar el número 2. Fijémonos",
    "que la línea está completamente en rojo: eso significa que la cantidad disponible del producto en toda la empresa es 0.",
    "No hay en ninguna sucursal y hay que comprarlo. Vamos a agregar un segundo producto, buscándolo por código, y cargamos 28 unidades.",
    "Esta vez la línea no está toda roja, pero la montañita sí. Hacemos clic en ella: nos muestra que en nuestra sucursal no hay stock, pero el",
    "detalle por ubicación muestra 25 unidades en otras sucursales, que hay que traer. Si no tenemos el código, podemos usar",
    "Buscar más, donde se abre el listado de productos, y hacemos la búsqueda del que queramos.",
    "Vamos a elegir un producto y cargamos 8 unidades,",
    "y la montañita se ve de color verde: quiere decir que hay 18 unidades en nuestra sucursal y se entrega",
    "de inmediato. Y con estos colores ya sabés qué plazo prometerle al cliente.",
])

B4 = (110.1, [
    "El Bloque 4 es cómo encontrar cualquier cotización u orden en segundos. Tocamos la flecha del buscador y con el filtro Mis órdenes",
    "ves solamente las tuyas. Sacamos ese filtro y probamos con Por facturar: quedan solo las órdenes confirmadas que todavía no se facturaron.",
    "Fijate que la columna de la derecha lo confirma. Para sacar un filtro, tocamos la cruz. Ahora, si necesitamos una orden puntual,",
    "nos fijamos en el número; por ejemplo, esta es la S46900. Escribís el número en el buscador",
    "y elegís Buscar Orden, y aparece solo esa. También podés buscar por cliente: entramos a la orden, copiamos el nombre del",
    "cliente y volvemos. Lo pegás en el buscador, pero esta vez elegís Buscar Cliente. Así ves todas las órdenes de ese cliente.",
    "Otra herramienta muy útil es Agrupar por. Si agrupás por cliente, la lista se arma en grupos, uno por cada cliente,",
    "con la cantidad de órdenes y el total. Tocás uno y se despliega. Con Agregar grupo personalizado podés agrupar",
    "por lo que necesites. Elegimos Estado y de un vistazo ves cuántas son cotizaciones, cuántas órdenes de venta y cuántas están canceladas.",
    "Probemos con Estado de la entrega: así sabemos qué está completamente entregado, qué salió a medias y qué todavía no se entregó.",
    "Y con Estado de actividad ves qué órdenes tienen tareas vencidas, planificadas o ninguna. «Overdue» quiere decir vencida.",
    "Si usás siempre la misma búsqueda, guardala en Favoritos: tocamos Guardar búsqueda actual y le ponés un",
    "nombre. Si querés que la vean tus compañeros, la podés compartir: tildamos Compartido y después tocamos Guardar. La próxima vez la",
    "encontrás en Favoritos, a un clic. ¡Listo! Ya sabés cómo encontrar cualquier orden en segundos.",
])

B3 = [
    (0.0, 5.0, "Las columnas que se muestran en la lista de órdenes de venta son personalizables."),
    (5.0, 9.0, "En este caso tenemos Estado, Estado de la entrega y Estado de la factura."),
    (9.0, 19.0, "Si entramos a una orden que todavía es una cotización y enviamos esa cotización al cliente por correo electrónico,"),
    (19.0, 26.0, "veremos que esta cotización pasa a ser una cotización enviada."),
    (26.0, 31.0, "Podemos corroborarlo en la barra de estado de la orden."),
    (31.0, 37.0, "Asimismo, se ve reflejado en el historial de la orden que se envió la cotización al cliente."),
    (37.0, 45.0, "Una vez que se confirma esta cotización, pasa al estado de orden de venta."),
    (45.0, 53.0, "Por eso podemos ver cuánto falta para la entrega de este pedido."),
    (53.0, 58.0, "Si ahora ingresamos a una cotización y la cancelamos,"),
    (58.0, 64.0, "veremos que se agrega un nuevo estado en la barra de estado, que dice Cancelado."),
    (64.0, 68.0, "Y esta misma acción se verá reflejada en el historial de la orden."),
]


def fmt(t):
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"


def wrap(text):
    """Corta una frase en renglones de ~42 letras (máx. 2)."""
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > MAX_CHARS // 2 and cur:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    lines.append(cur)
    return "\n".join(lines)


def chunk(text):
    """Divide el texto en partes de hasta MAX_CHARS, cortando en palabras."""
    parts, cur = [], ""
    for w in text.split():
        if len(cur) + len(w) + 1 > MAX_CHARS and cur:
            parts.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        parts.append(cur)
    return parts


def from_windows(total, windows, step=8.0):
    # 1) a cada palabra le toca un momento, repartido dentro de su tramo según las letras
    words = []
    for i, text in enumerate(windows):
        start, end = i * step, min((i + 1) * step, total)
        ws = text.split()
        n = sum(len(w) + 1 for w in ws)
        pos = 0
        for w in ws:
            words.append((w, start + (end - start) * pos / n))
            pos += len(w) + 1
    # 2) se agrupan en subtítulos, cortando preferentemente en puntos y comas
    cues, cur = [], []
    for k, (w, t) in enumerate(words):
        cur.append((w, t))
        text = " ".join(x for x, _ in cur)
        nxt = words[k + 1][0] if k + 1 < len(words) else ""
        punct = w[-1] in ".:;!?," and len(text) >= 38
        too_long = len(text) + len(nxt) + 1 > MAX_CHARS
        if punct or too_long or not nxt:
            cues.append([cur[0][1], None, text])
            cur = []
    for k, c in enumerate(cues):
        c[1] = cues[k + 1][0] if k + 1 < len(cues) else total
    return [tuple(c) for c in cues]


def write(n, cues):
    out = ["WEBVTT", ""]
    for i, (a, b, text) in enumerate(cues, 1):
        out += [str(i), f"{fmt(a + OFFSET)} --> {fmt(b + OFFSET)}", wrap(text), ""]
    path = ROOT / "media" / f"bloque{n}" / "subtitulos.vtt"
    path.write_text("\n".join(out), encoding="utf-8")
    print(f"{path.relative_to(ROOT)}: {len(cues)} subtítulos")


write(2, from_windows(*B2))
write(3, B3)
write(4, from_windows(*B4))
