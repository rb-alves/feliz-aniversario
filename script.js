// Referências aos elementos do DOM
const clickBtn = document.getElementById('clickBtn');
const progressFill = document.getElementById('progressFill');
const clickScreen = document.getElementById('clickScreen');
const carouselScreen = document.getElementById('carouselScreen');
const heartsContainer = document.getElementById('heartsContainer');

const carouselContent = document.getElementById('carouselContent');
const nextBtn = document.getElementById('nextBtn');
const timelineTrack = document.getElementById('timelineTrack');
const timelineFill = document.getElementById('timelineFill');
const timelineButton = document.getElementById('timelineButton');

const finalScreen = document.getElementById('finalScreen'); // Nova tela final
const cakeAnimation = document.getElementById('cakeAnimation'); // Elemento do bolo
const finalMessage = document.getElementById('finalMessage'); // Elemento da mensagem final

// Variáveis para o controle da tela de clique
let clicks = 0;
const maxClicks = 25; // Número de cliques necessários para desbloquear
const initialShakeDuration = 2; // Duração inicial da animação em segundos
const minShakeDuration = 0.2; // Duração mínima da animação em segundos (mais rápido)

/**
 * Cria e anima um coração saltando do botão.
 */
function createHeart() {
  const heart = document.createElement('div');
  heart.classList.add('heart');
  heart.innerHTML = '❤';

  // Obtém a posição e as dimensões do botão
  const buttonRect = clickBtn.getBoundingClientRect();

  // Posiciona o coração no centro do botão
  // Esses valores são relativos à viewport, já que heartsContainer agora é fixo
  heart.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
  heart.style.top = `${buttonRect.top + buttonRect.height / 2}px`;

  // Define variáveis CSS para movimento horizontal aleatório e posição Y alvo
  // A posição Y alvo faz com que eles flutuem para cima em relação ao ponto de partida
  heart.style.setProperty('--random-x', `${Math.random() * 100 - 50}px`); // +/- 50px de movimento horizontal
  heart.style.setProperty('--target-y', `${-100 - Math.random() * 50}px`); // Flutua entre 100px e 150px para cima

  heartsContainer.appendChild(heart);

  // Remove o coração após a animação para limpar o DOM
  setTimeout(() => heart.remove(), 1000);
}

/**
 * Atualiza a barra de progresso e transiciona para a tela do carrossel quando completa.
 */
function updateProgress() {
  const percent = (clicks / maxClicks) * 100;
  progressFill.style.width = percent + '%';
  progressFill.setAttribute('aria-valuenow', percent); // Atualiza o valor para acessibilidade

  // Calcula a nova duração da animação de balanço
  // A duração diminui linearmente de initialShakeDuration para minShakeDuration
  const currentShakeDuration = initialShakeDuration - 
                               ((initialShakeDuration - minShakeDuration) * (clicks / maxClicks));
  
  // Aplica a nova duração como uma variável CSS
  clickBtn.style.setProperty('--shake-duration', `${currentShakeDuration}s`);

  if (clicks >= maxClicks) {
    // Esconde a tela de clique e mostra a tela do carrossel
    clickScreen.classList.add('d-none');
    carouselScreen.classList.remove('d-none');
    // Renderiza a primeira mensagem do carrossel
    renderMessage(currentIndex);
    // Remove a animação de balanço quando o botão é desbloqueado
    clickBtn.classList.remove('animate-shake');
    clickBtn.style.removeProperty('--shake-duration'); // Remove a variável CSS
  }
}

// Adiciona o evento de clique ao botão principal
clickBtn.addEventListener('click', () => {
  if (clicks < maxClicks) {
    clicks++;
    createHeart(); // Cria um coração
    updateProgress(); // Atualiza o progresso e a velocidade do balanço
  }
});

// Mensagens para o carrossel de texto
const messages = [
  "Feliz aniversário, meu amor!",
  "Você é a luz que ilumina meus dias 💖",
  "Cada momento ao seu lado é único ✨",
  "Nossa história é a minha favorita, cheia de risadas e amor.",
  "Que este novo ciclo traga ainda mais alegria e realizações.",
  "Te amo mais do que ontem e menos do que amanhã ❤️",
  "Obrigada por existir e por ser quem você é! 🎉",
  "E para finalizar, uma surpresa especial para você!" // Última mensagem antes da tela final
];

// Variável para controlar o índice da mensagem atual no carrossel
let currentIndex = 0;
let isDragging = false; // Estado para controlar se o botão da linha do tempo está sendo arrastado

/**
 * Renderiza a mensagem atual no carrossel e atualiza a linha do tempo.
 * @param {number} index O índice da mensagem a ser exibida.
 */
function renderMessage(index) {
  // Se for a última mensagem, prepara para mostrar a tela final
  if (index >= messages.length -1) { // -1 porque o último índice é messages.length - 1
    nextBtn.innerText = "Ver Surpresa!"; // Muda o texto do botão
  } else {
    nextBtn.innerText = "Próximo ➜"; // Volta o texto normal
  }

  // Garante que o índice esteja dentro dos limites válidos
  currentIndex = Math.max(0, Math.min(index, messages.length - 1));
  carouselContent.innerText = messages[currentIndex]; // Exibe o texto principal
  updateTimeline(currentIndex);
}

/**
 * Atualiza a visualização da linha do tempo (preenchimento, botão e checkpoints).
 * @param {number} index O índice da mensagem atual.
 */
function updateTimeline(index) {
  const totalMessages = messages.length;
  // Calcula a porcentagem de preenchimento para a linha do tempo e a posição do botão
  // Ajusta o total de mensagens para que a barra não vá 100% no último item do carrossel,
  // mas sim no penúltimo, para que o último clique seja para a tela final.
  const timelineMaxIndex = totalMessages - 1; // Ajustado para ir até a última mensagem do carrossel
  const percent = (index / timelineMaxIndex) * 100;

  timelineFill.style.width = percent + '%';
  timelineButton.style.left = percent + '%'; // Posiciona o botão na linha do tempo

  // Cria dinamicamente os checkpoints (bolinhas) se ainda não foram criados
  if (!timelineTrack.dataset.checkpointsRendered) {
    for (let i = 0; i < totalMessages; i++) {
      const checkpoint = document.createElement('div');
      checkpoint.classList.add('timeline-checkpoint');
      checkpoint.dataset.index = i;
      const pos = (i / timelineMaxIndex) * 100;
      checkpoint.style.left = pos + '%';
      timelineTrack.appendChild(checkpoint);
    }
    timelineTrack.dataset.checkpointsRendered = "true"; // Marca como renderizado
  }

  // Atualiza o estado ativo/inativo dos checkpoints
  const allCheckpoints = timelineTrack.querySelectorAll('.timeline-checkpoint');
  allCheckpoints.forEach((cp, i) => {
    if (i <= index) {
      cp.classList.remove('inactive'); // Checkpoint ativo
    } else {
      cp.classList.add('inactive'); // Checkpoint inativo
    }
  });
}

/**
 * Move o carrossel para uma mensagem específica e atualiza a linha do tempo.
 * @param {number} newIndex O índice da mensagem para a qual navegar.
 */
function goToMessage(newIndex) {
  if (newIndex >= messages.length) {
    // Se for além da última mensagem, mostra a tela final
    carouselScreen.classList.add('d-none');
    finalScreen.classList.remove('d-none');
    // Inicia a animação do bolo e do texto
    cakeAnimation.style.opacity = 0; // Garante que comece invisível
    cakeAnimation.style.transform = 'scale(0.5)';
    finalMessage.style.opacity = 0; // Garante que comece invisível
    cakeAnimation.style.animation = 'fadeInScale 1.5s ease-out forwards';
    finalMessage.style.animation = 'fadeInText 2s ease-out forwards';
    finalMessage.style.animationDelay = '1s'; // Atraso para o texto aparecer depois do bolo

    // Opcional: Iniciar confetes
    setTimeout(createConfetti, 500); // Cria confetes após 0.5s
    setTimeout(createConfetti, 1000);
    setTimeout(createConfetti, 1500);
    setTimeout(createConfetti, 2000);

  } else {
    renderMessage(newIndex);
  }
}

// Event listeners para o botão "Próximo"
nextBtn.addEventListener('click', () => {
  goToMessage(currentIndex + 1); // Sempre tenta ir para o próximo
});

// Lógica para arrastar o botão da linha do tempo (Mouse Events)
timelineButton.addEventListener('mousedown', (e) => {
  isDragging = true;
  timelineButton.style.cursor = 'grabbing'; // Muda o cursor para indicar arrasto
  e.preventDefault(); // Previne seleção de texto ao arrastar
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const trackRect = timelineTrack.getBoundingClientRect();
  let clientX = e.clientX;

  // Calcula a nova posição do botão dentro da trilha
  let newLeft = clientX - trackRect.left;
  // Limita a posição para ficar dentro da trilha (0% a 100%)
  newLeft = Math.max(0, Math.min(newLeft, trackRect.width));

  const percent = (newLeft / trackRect.width) * 100;
  timelineButton.style.left = percent + '%';
  timelineFill.style.width = percent + '%';

  // Determina o novo índice da mensagem com base na posição
  const totalMessages = messages.length;
  // Ajusta para a última mensagem do carrossel
  const timelineMaxIndex = totalMessages - 1;
  const newIndex = Math.round((percent / 100) * (timelineMaxIndex));

  // Atualiza a mensagem apenas se o índice mudou
  if (newIndex !== currentIndex) {
    goToMessage(newIndex);
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  timelineButton.style.cursor = 'grab'; // Volta o cursor normal
});

// Lógica para arrastar o botão da linha do tempo (Touch Events para dispositivos móveis)
timelineButton.addEventListener('touchstart', (e) => {
  isDragging = true;
  e.preventDefault(); // Previne o comportamento padrão do toque (ex: rolagem)
}, { passive: false }); // Use { passive: false } para permitir preventDefault

document.addEventListener('touchmove', (e) => {
  if (!isDragging || !e.touches[0]) return;

  const trackRect = timelineTrack.getBoundingClientRect();
  let clientX = e.touches[0].clientX; // Pega a posição do primeiro toque

  let newLeft = clientX - trackRect.left;
  newLeft = Math.max(0, Math.min(newLeft, trackRect.width));

  const percent = (newLeft / trackRect.width) * 100;
  timelineButton.style.left = percent + '%';
  timelineFill.style.width = percent + '%';

  const totalMessages = messages.length;
  const timelineMaxIndex = totalMessages - 1;
  const newIndex = Math.round((percent / 100) * (timelineMaxIndex));

  if (newIndex !== currentIndex) {
    goToMessage(newIndex);
  }
}, { passive: false }); // Use { passive: false }

document.addEventListener('touchend', () => {
  isDragging = false;
});

// Adiciona funcionalidade de clique na trilha da linha do tempo para pular para uma mensagem
timelineTrack.addEventListener('click', (e) => {
  // Se o clique foi no botão, a lógica de arrastar já lidou com isso
  if (e.target === timelineButton) return;

  const trackRect = timelineTrack.getBoundingClientRect();
  let clickX = e.clientX - trackRect.left; // Posição do clique relativa à trilha

  const percent = (clickX / trackRect.width) * 100;

  const totalMessages = messages.length;
  const timelineMaxIndex = totalMessages - 1;
  const newIndex = Math.round((percent / 100) * (timelineMaxIndex));
  goToMessage(newIndex);
});

// Função para criar e animar confetes
function createConfetti() {
  const confettiContainer = document.querySelector('.confetti-container');
  const colors = ['#FF6F91', '#FFB6C1', '#FFD1DC', '#FFFFFF', '#FFD700']; // Cores dos confetes
  
  for (let i = 0; i < 10; i++) { // Cria 10 confetes por vez
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
    confetti.style.setProperty('--start-x', `${Math.random() * 100}vw`);
    confetti.style.setProperty('--start-y', `${Math.random() * -50}px`); // Começa acima da tela
    confetti.style.setProperty('--end-x', `${Math.random() * 100}vw`);
    confetti.style.setProperty('--end-y', `100vh`); // Cai para fora da tela
    confetti.style.setProperty('--fall-duration', `${Math.random() * 3 + 2}s`); // Duração da queda
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * -20}%`; // Posição inicial aleatória
    confettiContainer.appendChild(confetti);

    setTimeout(() => confetti.remove(), parseFloat(confetti.style.getPropertyValue('--fall-duration')) * 1000);
  }
}


// Renderiza a primeira mensagem e a linha do tempo ao carregar a página
renderMessage(currentIndex);