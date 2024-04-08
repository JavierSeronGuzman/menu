gsap.registerPlugin(ScrollTrigger);

let iteration = 0; // se incrementa cuando se desplaza hasta el final o el principio y se envuelve, lo que nos permite continuar suavemente el desplazamiento de la cabeza de reproducción en la dirección correcta.

const spacing = 0.1,    // espaciado de las tarjetas (escalonamiento)
  snap = gsap.utils.snap(spacing), // lo usaremos para ajustar la cabeza de reproducción en seamlessLoop
  cards = gsap.utils.toArray('.cards li'),
  seamlessLoop = buildSeamlessLoop(cards, spacing),
  scrub = gsap.to(seamlessLoop, { // reutilizamos este tween para ajustar suavemente la cabeza de reproducción en seamlessLoop
    totalTime: 0,
    duration: 0.5,
    ease: "power3",
    paused: true
  }),
  trigger = ScrollTrigger.create({
    start: 0,
    onUpdate(self) {
      if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
        // wrapForward(self);
      } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
        // wrapBackward(self);
      } else {
        scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
        scrub.invalidate().restart(); // para mejorar el rendimiento, simplemente invalidamos y reiniciamos el mismo tween. No es necesario sobrescribir o crear un nuevo tween en cada actualización.
        self.wrapping = false;
      }
    },
    end: "+=3000",
    pin: ".gallery"
  });
  
function buildSeamlessLoop(items, spacing) {
  let overlap = Math.ceil(1 / spacing), // número de animaciones EXTRA a cada lado del inicio / fin para acomodar el bucle continuo
    startTime = items.length * spacing + 0.5, // el tiempo en rawSequence en el que comenzaremos el bucle sin problemas
    loopTime = (items.length + overlap) * spacing + 1, // el punto al final donde volvemos al startTime
    rawSequence = gsap.timeline({paused: true}), // aquí es donde viven todas las animaciones "reales"
    seamlessLoop = gsap.timeline({ // esto simplemente ajusta la cabeza de reproducción de rawSequence para que parezca que se repite sin problemas
      paused: true,
      repeat: -1, // para acomodar el desplazamiento / bucle infinito
      onRepeat() { // soluciona un error de caso extremadamente raro que se solucionó en GSAP 3.6.1
        this._time === this._dur && (this._tTime += this._dur - 0.01);
      }
    }),
    l = items.length + overlap * 2,
    time = 0,
    i, index, item;

  // establecer estado inicial de los elementos
  gsap.set(items, {yPercent: 400, opacity: 0, scale: 0});

  // ahora recorremos y creamos todas las animaciones de manera escalonada. Recuerde, debemos crear ANIMACIONES EXTRA al final para acomodar el bucle sin problemas.
  for (i = 0; i < l; i++) {
    index = i % items.length;   
    item = items[index];
    time = i * spacing;
    rawSequence.fromTo(item, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false}, time)
               .fromTo(item, {yPercent: 400}, {yPercent: -400, duration: 1, ease: "none", immediateRender: false}, time);
    i <= items.length && seamlessLoop.add("label" + i, time); // realmente no necesitamos estos, pero si quisieras saltar a puntos clave usando etiquetas, aquí tienes.
  }
  
  // aquí es donde configuramos el ajuste de la cabeza de reproducción para que parezca sin problemas.
  rawSequence.time(startTime);  
  seamlessLoop.to(rawSequence, {
    time: loopTime,
    duration: loopTime - startTime,
    ease: "none"
  }).fromTo(rawSequence, {time: overlap * spacing + 1}, {
    time: startTime,
    duration: startTime - (overlap * spacing + 1),
    immediateRender: false,
    ease: "none"
  });
  return seamlessLoop;
} 

