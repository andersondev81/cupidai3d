// AudioManager.js
// Um sistema simples para gerenciar áudio na aplicação Cupid's Church

class AudioManager {
    constructor() {
      this.sounds = {};
      this.isMuted = false;
      this.volume = 0.5; // volume padrão (0-1)

      // Configurar sons para diferentes transições
      this.setupSounds();

      // Flag para verificar se o navegador permite reprodução automática
      this.canAutoplay = false;

      // Verificar se o áudio pode ser reproduzido automaticamente
      this.checkAutoplay();
    }

    // Configurar os sons para diferentes transições
    setupSounds() {
      // Sons de transição para diferentes seções
      this.registerSound('transition', '/public/sounds/camerawoosh.MP3', { loop: false, volume: 0.1 });
      // this.registerSound('nav', '../sounds/camerawoosh.MP3');
      this.registerSound('about', '/sounds/nav.mp3');
      this.registerSound('aidatingcoach', '/public/sounds/daingcoachmirror.MP3', { loop: true, volume: 0.1 });
      this.registerSound('download', '/sounds/download.mp3');
      this.registerSound('token', '/public/sounds/atmambiance.mp3', { loop: true, volume: 0.1 });
      this.registerSound('roadmap', '/public/sounds/roadmapscroll.mp3', { loop: true, volume: 0.1 });

      // Sons para interações
      this.registerSound('click', '/sounds/click.mp3');
      this.registerSound('hover', '/sounds/hover.mp3');

      // Som ambiente
      this.registerSound('ambient', '/sounds/ambient.mp3', { loop: true, volume: 0.2 });
    this.registerSound('orb', '/sounds/orb.mp3', { loop: true, volume: 0.3 });
    }

    // Verificar se o navegador permite reprodução automática de áudio
    checkAutoplay() {
      const audio = new Audio();
      audio.volume = 0;

      // Tenta reproduzir um áudio silencioso para verificar permissão
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.canAutoplay = true;
            audio.pause();
          })
          .catch(error => {
            this.canAutoplay = false;
            console.log('Reprodução automática de áudio não permitida pelo navegador');
          });
      }
    }

    // Registrar um novo som no gerenciador
    registerSound(id, path, options = {}) {
      const audio = new Audio();
      audio.src = path;
      audio.volume = options.volume || this.volume;

      // Configurar loop explicitamente - por padrão, todos (exceto transição) em loop
      const shouldLoop = id === 'transition' || id === 'click' || id === 'hover'
        ? false
        : (options.loop !== undefined ? options.loop : true);

      audio.loop = shouldLoop;

      console.log(`Registrando som: ${id}, loop: ${audio.loop}, volume: ${audio.volume}`);

      this.sounds[id] = {
        audio: audio,
        volume: options.volume || this.volume,
        isPlaying: false,
        loop: shouldLoop
      };

      // Configurar o evento de fim da reprodução
      audio.addEventListener('ended', () => {
        // Se não for loop, marcar como não tocando mais
        if (!shouldLoop) {
          this.sounds[id].isPlaying = false;
        }
      });
    }

    // Modificação no método play para garantir loop contínuo
    play(id) {
      if (this.isMuted || !this.sounds[id]) return;

      const sound = this.sounds[id];

      // Garantir que loop esteja configurado corretamente antes de tocar
      sound.audio.loop = sound.loop;

      // Se já estiver tocando, não faça nada para evitar reinício
      // Exceto para sons sem loop (transition, click, hover)
      if (sound.isPlaying) {
        if (!sound.loop) {
          sound.audio.currentTime = 0;
        } else {
          // Já está tocando em loop, não faça nada
          return;
        }
      }

      // Marcar como tocando e iniciar a reprodução
      sound.isPlaying = true;
      sound.audio.volume = sound.volume;

      // Usar Promise para compatibilidade com diferentes navegadores
      const playPromise = sound.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          sound.isPlaying = false;
          console.error(`Erro ao reproduzir o som ${id}:`, error);
        });
      }
    }

    // Parar um som específico
    stop(id) {
      if (!this.sounds[id]) return;

      const sound = this.sounds[id];
      if (sound.isPlaying) {
        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.isPlaying = false;
      }
    }

    // Pausar um som específico
    pause(id) {
      if (!this.sounds[id]) return;

      const sound = this.sounds[id];
      if (sound.isPlaying) {
        sound.audio.pause();
      }
    }

    // Retomar a reprodução de um som pausado
    resume(id) {
      if (this.isMuted || !this.sounds[id]) return;

      const sound = this.sounds[id];
      if (!sound.isPlaying) {
        const playPromise = sound.audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              sound.isPlaying = true;
            })
            .catch(error => {
              console.error(`Erro ao retomar o som ${id}:`, error);
            });
        }
      }
    }

    // Reproduzir som de transição para uma seção específica
    playTransitionSound(sectionName) {
      // Primeiro reproduz o som genérico de transição
      this.play('transition');

      // Depois reproduz o som específico da seção, se existir
      if (this.sounds[sectionName]) {
        setTimeout(() => {
          this.play(sectionName);
        }, 300); // Pequeno atraso para não sobrepor imediatamente o som de transição
      }
    }

    // Reproduz som de clique (para botões e interações)
    playClickSound() {
      this.play('click');
    }

    // Reproduz som de hover (para feedbacks ao passar mouse sobre elementos interativos)
    playHoverSound() {
      this.play('hover');
    }

    // Iniciar áudio ambiente
    startAmbient() {
      this.play('ambient');
    }

    // Parar áudio ambiente
    stopAmbient() {
      this.stop('ambient');
    }

    // Ativar/desativar mudo
    toggleMute() {
      this.isMuted = !this.isMuted;

      // Aplicar estado de mudo a todos os sons
      Object.keys(this.sounds).forEach(id => {
        this.sounds[id].audio.muted = this.isMuted;
      });

      return this.isMuted;
    }

    stopSectionSounds(sectionName) {
      // Para o som específico da seção, se existir
      if (this.sounds[sectionName]) {
        this.stop(sectionName);
      }

      // Parar sons específicos associados à seção
      switch(sectionName) {
        case 'nav':
          // Sons associados à seção principal
          break;
        case 'about':
          // Sons associados à seção about
          break;
        case 'aidatingcoach':
          // Sons associados à seção do espelho
          this.stop('mirror');
          break;
        case 'download':
          // Sons associados à seção de download
          break;
        case 'token':
          // Sons associados à seção do ATM
          this.stop('coins');
          this.stop('atm');
          break;
        case 'roadmap':
          // Sons associados à seção do pergaminho
          this.stop('scroll');
          this.stop('paper');
          break;
      }
    }

    stopAllSectionSounds() {
      // Lista de todas as seções
      const sections = ['nav', 'about', 'aidatingcoach', 'download', 'token', 'roadmap'];

      // Para os sons de cada seção
      sections.forEach(section => {
        this.stopSectionSounds(section);
      });

      // Para sons adicionais que podem estar tocando
      ['transition', 'mirror', 'atm', 'scroll', 'coins', 'paper'].forEach(sound => {
        if (this.sounds[sound]) {
          this.stop(sound);
        }
      });
    }

    // Definir volume global
    setVolume(value) {
      this.volume = Math.max(0, Math.min(1, value)); // Garantir que o valor está entre 0 e 1

      // Aplicar volume a todos os sons, respeitando suas configurações individuais
      Object.keys(this.sounds).forEach(id => {
        const sound = this.sounds[id];
        const individualVolume = sound.volume || this.volume;
        sound.audio.volume = this.isMuted ? 0 : individualVolume;
      });
    }



    // Pré-carregar todos os sons para melhor performance
    preloadAll() {
      Object.keys(this.sounds).forEach(id => {
        const sound = this.sounds[id];
        sound.audio.load();
      });
    }
  }

  // Exportar uma instância única para toda a aplicação
  const audioManager = new AudioManager();
  export default audioManager;