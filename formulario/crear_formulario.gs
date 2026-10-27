/**
 * Crea el Google Form de evaluación final de la capacitación de Ventas en Odoo.
 *
 * Uso:
 *   1. Entrá a https://script.google.com con la cuenta que va a ser dueña del formulario.
 *   2. Nuevo proyecto → pegá este código → Guardar.
 *   3. Elegí la función "crearFormulario" y tocá Ejecutar (la primera vez pide permisos).
 *   4. En el Registro de ejecución aparecen los links para responder y para editar.
 */
function crearFormulario() {
  const form = FormApp.create('Evaluación final · Capacitación Ventas en Odoo');
  form
    .setDescription(
      'Gracias por hacer la capacitación. Este formulario nos ayuda a saber si sirvió y qué mejorar.\n' +
      'Son unos 8 minutos. La parte de preguntas no es un examen con nota para tu legajo: es para ver qué temas quedaron claros.'
    )
    .setIsQuiz(true)
    .setShuffleQuestions(false)
    .setProgressBar(true)
    .setCollectEmail(false)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setConfirmationMessage('¡Gracias! Tus respuestas nos ayudan a mejorar la capacitación.');

  // ---------- 1. Datos ----------
  form.addSectionHeaderItem().setTitle('Sobre vos').setHelpText('Solo para agrupar resultados. El nombre es opcional.');
  form.addTextItem().setTitle('Nombre (opcional)');
  form.addTextItem().setTitle('Sucursal').setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('¿Hace cuánto usás Odoo Ventas?')
    .setChoiceValues(['Menos de 1 mes', 'Entre 1 y 6 meses', 'Entre 6 meses y 1 año', 'Más de 1 año'])
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('¿Qué bloques hiciste?')
    .setChoiceValues([
      'Bloque 0 · Introducción al módulo de Ventas',
      'Bloque 1 · Creación de una cotización',
      'Bloque 2 · Control y disponibilidad de stock',
      'Bloque 3 · Trazabilidad y seguimiento de órdenes',
      'Bloque 4 · Criterios de búsqueda y consulta',
    ])
    .setRequired(true);

  // ---------- 2. Conocimientos (autocorregible) ----------
  form.addPageBreakItem()
    .setTitle('¿Qué te quedó?')
    .setHelpText('11 preguntas cortas, 2 o 3 por bloque. Elegí la opción que te parezca correcta.');

  const preguntas = [
    // Bloque 0
    ['Bloque 0 · Estás adentro de la orden S53276 y querés volver al listado. ¿Qué tocás?',
      ['"Órdenes de venta", en el camino de arriba a la izquierda', 'Cancelar', 'Confirmar', 'Cerrar el navegador y volver a entrar'], 0,
      'El camino de arriba (Órdenes de venta / S…) te dice dónde estás y te deja volver.'],
    ['Bloque 0 · Aparece un aviso rojo que bloquea la confirmación y no lo entendés. ¿Qué hacés?',
      ['Toco "Ignorar Excepciones" para poder seguir', 'Leo el mensaje, saco una captura y consulto al equipo de Sistemas (o a quien indique el mensaje)', 'Borro la cotización y la hago de nuevo', 'Espero un rato y vuelvo a tocar Confirmar'], 1,
      'Pará, leé, sacá captura y consultá. No "destrabes" nada por tu cuenta.'],
    // Bloque 1
    ['Bloque 1 · Al crear una cotización, ¿cuál es el primer dato que tenés que cargar?',
      ['El vencimiento', 'El cliente', 'La referencia del cliente', 'Las notas internas'], 1,
      'Lo primero, y lo único obligatorio de arriba, es el cliente.'],
    ['Bloque 1 · Al elegir el cliente, ¿qué completa Odoo solo?',
      ['Los productos y las cantidades', 'El total y el IVA', 'Las direcciones de factura y entrega, la lista de precios y los términos de pago', 'Nada: hay que cargar todo a mano'], 2,
      'Al elegir el cliente se completan direcciones, lista de precios y términos de pago. Igual hay que revisarlos.'],
    ['Bloque 1 · Tocaste Confirmar. ¿Qué te confirma que quedó bien?',
      ['Arriba sigue diciendo "Nuevo"', 'La barra sigue en "Cotización"', 'Tiene número (S…) y la barra marca "Orden de venta"', 'Aparece el botón "Enviar por correo electrónico"'], 2,
      'Una orden confirmada tiene número, la barra marca "Orden de venta" y figura "Bloqueada".'],
    // Bloque 2
    ['Bloque 2 · En una línea de la cotización la montañita está verde. ¿Qué significa?',
      ['Hay stock suficiente en tu sucursal', 'Hay que traerlo de otra sucursal', 'No hay en ningún lado y hay que comprarlo', 'El producto está en oferta'], 0,
      'Montañita verde = lo tenés en tu sucursal. Podés entregar sin esperar.'],
    ['Bloque 2 · La línea aparece toda en rojo y "Stock empresa" marca 0. ¿Qué le decís al cliente?',
      ['Que se lo entregás en el momento', 'Que se trae de otra sucursal', 'Que hay que comprarlo: es el plazo más largo', 'Nada, se confirma igual'], 2,
      'Línea toda roja = no hay en toda la empresa. Hay que comprarlo: avisá el plazo antes de confirmar.'],
    // Bloque 3
    ['Bloque 3 · En el listado, ¿qué te dice la columna "Estado de la entrega"?',
      ['Si el cliente ya pagó', 'Si la mercadería ya salió del depósito', 'Si la cotización se mandó por mail', 'Quién hizo la venta'], 1,
      'Estado = etapa de la venta; Estado de la entrega = si salió la mercadería; Estado de la factura = si se facturó.'],
    ['Bloque 3 · Una orden está en "Cotización" y la entrega dice "Nada…". ¿Está mal?',
      ['Sí, el depósito se olvidó de entregarla', 'Sí, hay que facturarla ya', 'No: hasta que no se confirma no hay nada que entregar', 'Sí, hay que cancelarla'], 2,
      'Entrega y factura recién se mueven cuando la orden pasa a "Orden de venta".'],
    // Bloque 4
    ['Bloque 4 · ¿Cuál es la diferencia entre filtrar y agrupar?',
      ['Ninguna, hacen lo mismo', 'El filtro decide qué órdenes ves; la agrupación las ordena en grupos', 'Agrupar borra las órdenes que no sirven', 'Filtrar solo funciona con fechas'], 1,
      'El filtro achica la lista; la agrupación la ordena en grupos con cantidad y total. Se pueden usar juntos.'],
    ['Bloque 4 · Querés que todo el equipo pueda usar tu búsqueda guardada. ¿Qué tildás al guardarla en Favoritos?',
      ['Filtro predeterminado', 'Compartido', 'Nada, ya la ven todos', 'Las dos opciones siempre'], 1,
      '"Compartido" la pone en los Favoritos de todos. Sin tildarlo, queda solo para vos.'],
  ];

  preguntas.forEach(([titulo, opciones, correcta, explicacion]) => {
    const item = form.addMultipleChoiceItem();
    item
      .setTitle(titulo)
      .setChoices(opciones.map((o, i) => item.createChoice(o, i === correcta)))
      .setPoints(1)
      .setRequired(true)
      .setFeedbackForCorrect(FormApp.createFeedback().setText('¡Bien! ' + explicacion).build())
      .setFeedbackForIncorrect(FormApp.createFeedback().setText(explicacion).build());
  });

  // ---------- 3. Confianza antes / después ----------
  form.addPageBreakItem()
    .setTitle('¿Qué tan seguro/a te sentís?')
    .setHelpText('1 = nada seguro/a · 5 = lo hago sin ayuda.');

  const tareas = [
    'Moverme por Ventas sin perderme (listado, ficha, volver)',
    'Crear y confirmar una cotización',
    'Revisar cliente, productos, cantidades y total antes de confirmar',
    'Leer el stock de una línea y avisar un plazo real',
    'Saber si una venta se entregó y se facturó',
    'Buscar una orden y usar filtros o favoritos',
  ];
  const escala = ['1', '2', '3', '4', '5'];
  form.addGridItem().setTitle('ANTES de la capacitación, ¿qué tan seguro/a te sentías para…?')
    .setRows(tareas).setColumns(escala).setRequired(true);
  form.addGridItem().setTitle('AHORA, después de la capacitación, ¿qué tan seguro/a te sentís para…?')
    .setRows(tareas).setColumns(escala).setRequired(true);

  // ---------- 4. Opinión sobre el material ----------
  form.addPageBreakItem().setTitle('Tu opinión sobre la capacitación');

  form.addGridItem()
    .setTitle('¿Qué tan útil te resultó cada bloque para tu trabajo?')
    .setRows([
      'Bloque 0 · Introducción',
      'Bloque 1 · Cotización',
      'Bloque 2 · Stock',
      'Bloque 3 · Seguimiento',
      'Bloque 4 · Búsqueda',
    ])
    .setColumns(['Nada útil', 'Poco útil', 'Útil', 'Muy útil', 'No lo hice']);

  form.addCheckboxItem()
    .setTitle('¿Qué te sirvió más para aprender? (podés marcar varias)')
    .setChoiceValues([
      'Las capturas con letras (A, B, C…)',
      'Las prácticas interactivas',
      'Las 3 preguntas rápidas de cada bloque',
      'El video',
      'El podcast',
    ])
    .showOtherOption(true);

  form.addScaleItem()
    .setTitle('¿Qué tan claras fueron las explicaciones?')
    .setBounds(1, 5).setLabels('Nada claras', 'Muy claras').setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('La duración de los bloques (~10 min cada uno) te pareció…')
    .setChoiceValues(['Muy corta', 'Adecuada', 'Muy larga'])
    .setRequired(true);

  form.addScaleItem()
    .setTitle('¿Recomendarías esta capacitación a un compañero que recién empieza?')
    .setBounds(1, 5).setLabels('No', 'Sí, seguro').setRequired(true);

  // ---------- 5. Comentarios ----------
  form.addPageBreakItem().setTitle('Para terminar');
  form.addParagraphTextItem().setTitle('¿Qué tarea de Ventas te sigue costando?');
  form.addParagraphTextItem().setTitle('¿Qué tema te gustaría que agreguemos a la capacitación?');
  form.addParagraphTextItem().setTitle('¿Algo más que quieras contarnos?');

  Logger.log('Link para responder: ' + form.getPublishedUrl());
  Logger.log('Link para editar:    ' + form.getEditUrl());
}
