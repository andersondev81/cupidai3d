// AudioManager.js
// Um sistema completo para gerenciar áudio na aplicação Cupid's Church

// Classe para representar posições 3D sem depender diretamente do THREE.js
class Position {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

class AudioManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.volume = 0.5; // volume padrão (0-1)
    this.loop = false; // loop padrão

    // NOVO: Estados de controle para loading
    this.isLoadingComplete = false;
    this.hasUserInteraction = false;
    this._ambientRequested = false;

    // Posições dos elementos para áudio espacial
    this.positions = {
      orb: new Position(1.76, 1.155, -0.883),
      fountain: new Position(0, 0.8, 2.406),
      portal: new Position(0, 1.247, -2.117),
      heart: new Position(0, 4.18, -0.006),
      pole: new Position(0.2, -0.35, -0.2),
    };

    // Configurar categorias de sons
    this.setupSoundCategories();

    // Configurar sons para diferentes transições
    this.setupSounds();

    // Configurar listeners para gerenciar estados de loading e interação do usuário
    this._setupEventListeners();
  }

  // NOVO: Configuração de listeners para sincronizar com sistema de loading
  _setupEventListeners() {
    // Escuta o evento de loading completo
    if (typeof window !== 'undefined') {
      window.addEventListener('loading-complete', () => {
        console.log('AudioManager: Loading completo, sons liberados para reprodução');
        this.isLoadingComplete = true;

        // Verifica se o ambiente foi solicitado e se temos interação do usuário
        if (this._ambientRequested && this.hasUserInteraction) {
          this.startAmbient();
        }
      });

      // Evento para quando o usuário interagir pela primeira vez
      const userInteractionEvents = ['click', 'touchstart', 'keydown'];
      const handleUserInteraction = () => {
        if (!this.hasUserInteraction) {
          this.hasUserInteraction = true;
          console.log('AudioManager: Interação do usuário detectada');

          // Se o loading estiver completo e o ambiente foi solicitado, inicie
          if (this.isLoadingComplete && this._ambientRequested) {
            this.startAmbient();
          }

          // Remove listeners após primeira interação
          userInteractionEvents.forEach(event => {
            window.removeEventListener(event, handleUserInteraction);
          });
        }
      };

      userInteractionEvents.forEach(event => {
        window.addEventListener(event, handleUserInteraction, { once: false });
      });
    }
  }

  // Configuração de categorias de sons para melhor gerenciamento
  setupSoundCategories() {
    // Definir categorias para os sons
    this.soundCategories = {
      // Sons de ambiente que sempre podem tocar em paralelo
      ambient: ["ambient", "water", "fountain", "heartbeat", "portal", "orb", "pole"],

      // Sons de transição que não são em loop
      transition: ["transition", "click", "hover"],

      // Sons de seções que devem ser exclusivos (apenas um toca por vez)
      section: [
        "nav",
        "about",
        "aidatingcoach",
        "download",
        "token",
        "roadmap",
      ],

      // Sons de elementos específicos que pertencem a seções
      sectionElements: {
        nav: [],
        about: [],
        aidatingcoach: ["mirror"],
        download: [],
        token: ["atm", "coins"],
        roadmap: ["scroll", "paper"],
      },
    };

    // Mapear sons para suas categorias para facilitar a busca
    this.soundToCategory = {};

    // Categorizar sons ambientes
    this.soundCategories.ambient.forEach((sound) => {
      this.soundToCategory[sound] = "ambient";
    });

    // Categorizar sons de transição
    this.soundCategories.transition.forEach((sound) => {
      this.soundToCategory[sound] = "transition";
    });

    // Categorizar sons de seções
    this.soundCategories.section.forEach((sound) => {
      this.soundToCategory[sound] = "section";
    });

    // Categorizar sons de elementos específicos
    Object.entries(this.soundCategories.sectionElements).forEach(
      ([section, elements]) => {
        elements.forEach((sound) => {
          this.soundToCategory[sound] = "sectionElement";
          this.soundToCategory[`${sound}_section`] = section; // Armazenar a seção pai
        });
      }
    );
  }

  setupSounds() {
    this.registerSound("transition", "../sounds/camerawoosh.MP3", {
      loop: false,
      volume: 0.1,
    });
    this.registerSound("aidatingcoach", "../sounds/daingcoachmirror.MP3", {
      loop: true,
      volume: 0.1,
    });
    this.registerSound("token", "../sounds/atmambiance.mp3", {
      loop: true,
      volume: 0.1,
    });
    this.registerSound("roadmap", "../sounds/roadmapscroll.mp3", {
      loop: true,
      volume: 0.1,
    });

    this.registerSound("ambient", "../sounds/templeambiance.mp3", {
      loop: true,
      volume: 1,
    });
    this.registerSound("orb", "../sounds/orb.mp3", {
      loop: true,
      volume: 0.3,
    });
    this.registerSound("fountain", "../sounds/fountain.mp3", {
      loop: true,
      volume: 0.3,
    });
    this.registerSound("pole", "../sounds/templeambiance.mp3", {
      loop: true,
      volume: 1,
    });
  }

  // Registrar um novo som no gerenciador
  registerSound(id, path, options = {}) {
    const audio = new Audio();
    audio.src = path;
    audio.volume = options.volume || this.volume;
    audio.loop = false;

    this.sounds[id] = {
      audio: audio,
      volume: options.volume || this.volume,
      isPlaying: false,
      loop: false,
    };
  }

  // MODIFICADO: Reproduzir um som específico apenas se o loading estiver completo
  play(id) {
    // Verificar se o áudio está bloqueado por condições de loading
    if (!this.canPlaySound(id)) return;

    // Sons comuns, de transição e de elementos específicos
    if (this.isMuted || !this.sounds[id]) return;

    const sound = this.sounds[id];

    // Garantir que loop esteja configurado corretamente antes de tocar
    sound.audio.loop = false;
    if (id === "pole" || id === "ambient" || id === "orb" || id === "fountain") {
      sound.audio.loop = true;
    }

    // Se já estiver tocando, não faça nada para evitar reinício
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
      playPromise.catch((error) => {
        sound.isPlaying = false;
        console.log(`Erro ao reproduzir o som ${id}:`, error);
      });
    }
  }

  // NOVO: Verificar se um som pode ser reproduzido com base no estado de loading
  canPlaySound(id) {
    // SEMPRE bloqueia sons durante o loading, exceto em casos especiais
    if (!this.isLoadingComplete) {
      console.log(`AudioManager: Tentativa de tocar ${id} durante loading bloqueada`);

      // Se for som ambiente, marque como solicitado para iniciar após o loading
      if (id === "ambient") {
        this._ambientRequested = true;
        console.log('AudioManager: Som ambiente será iniciado após loading');
      }

      return false;
    }

    // Bloqueia reprodução se não houver interação do usuário
    if (!this.hasUserInteraction) {
      console.log(`AudioManager: Tentativa de tocar ${id} bloqueada - aguardando interação`);

      // Marca o ambiente como solicitado para tocar após interação
      if (id === "ambient") {
        this._ambientRequested = true;
      }

      return false;
    }

    // Se o som estiver globalmente bloqueado por alguma flag (ex: transição)
    if (id === "transition" && window.blockTransitionSound) {
      return false;
    }

    // Se chegou até aqui, pode tocar o som
    return true;
  }

  // Parar um som específico
  stop(id) {
    if (!this.sounds[id]) return;

    // Exceção para o som "pole" que nunca deve ser parado em certas situações
    if (id === "pole" && this.soundToCategory[id] === "ambient") {
      return;
    }

    const sound = this.sounds[id];
    if (sound.isPlaying) {
      sound.audio.pause();
      sound.audio.currentTime = 0;
      sound.isPlaying = false;
    }
  }

  // MODIFICADO: Iniciar áudio ambiente com verificação de loading
  startAmbient() {
    this._ambientRequested = true;

    // Verifica se pode iniciar o áudio ambiente agora
    if (!this.isLoadingComplete || !this.hasUserInteraction) {
      console.log('AudioManager: Som ambiente solicitado, será iniciado quando possível');
      return;
    }

    console.log('AudioManager: Iniciando som ambiente');
    this.play("ambient");
  }

  // Parar áudio ambiente
  stopAmbient() {
    this._ambientRequested = false;
    this.stop("ambient");
  }

  // MODIFICADO: Reproduzir som de transição para uma seção específica
  playTransitionSound(sectionName) {
    // Primeiro verifica se pode tocar sons
    if (!this.isLoadingComplete || !this.hasUserInteraction) {
      console.log('AudioManager: Transição bloqueada durante loading');
      return;
    }

    // Tocar som de transição
    this.play("transition");

    // Depois reproduz o som específico da seção, se existir
    if (this.sounds[sectionName]) {
      setTimeout(() => {
        this.play(sectionName);
      }, 300); // Pequeno atraso para não sobrepor imediatamente o som de transição
    }
  }

  // Método para parar o som associado a uma seção específica
  stopSectionSounds(sectionName) {
    // Para o som específico da seção, se existir
    if (this.sounds[sectionName]) {
      this.stop(sectionName);
    }

    // Parar sons específicos associados à seção
    switch (sectionName) {
      case "nav":
        // Sons associados à seção principal
        break;
      case "about":
        // Sons associados à seção about
        break;
      case "aidatingcoach":
        // Sons associados à seção do espelho
        this.stop("mirror");
        break;
      case "download":
        // Sons associados à seção de download
        break;
      case "token":
        // Sons associados à seção do ATM
        this.stop("coins");
        this.stop("atm");
        break;
      case "roadmap":
        // Sons associados à seção do pergaminho
        this.stop("scroll");
        this.stop("paper");
        break;
    }
  }

  // Método para atualizar sons espaciais com base na posição da câmera
  updateSpatialSounds(cameraPosition) {
    // Verificar se pode reproduzir sons
    if (!this.isLoadingComplete || !this.hasUserInteraction) {
      return;
    }

    // Coordenadas do orb
    const orbPosition = { x: 1.76, y: 1.155, z: -0.883 };

    // Calcular distância
    const dx = cameraPosition.x - orbPosition.x;
    const dy = cameraPosition.y - orbPosition.y;
    const dz = cameraPosition.z - orbPosition.z;
    const distToOrb = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Ajustar som do orb
    const maxOrbDistance = 3.5;

    if (distToOrb < maxOrbDistance) {
      // Atenuação quadrática para queda de volume mais realista
      const attenuation = 1 - Math.pow(distToOrb / maxOrbDistance, 2);
      const orbVolume = Math.max(0, 0.3 * attenuation);

      if (this.sounds.orb) {
        // Aplicar volume apenas se for significativo
        if (orbVolume > 0.01) {
          this.sounds.orb.audio.volume = orbVolume;

          if (!this.sounds.orb.isPlaying) {
            this.play("orb");
          }
        } else {
          this.stop("orb");
        }
      }
    } else {
      // Se estiver fora do alcance, parar o som
      this.stop("orb");
    }

    // Código semelhante pode ser implementado para fountain e outros sons espaciais
    // Coordenadas da fonte
    const fountainPosition = { x: 0, y: 0.8, z: 2.406 };

    // Calcular distância
    const dfx = cameraPosition.x - fountainPosition.x;
    const dfy = cameraPosition.y - fountainPosition.y;
    const dfz = cameraPosition.z - fountainPosition.z;
    const distToFountain = Math.sqrt(dfx * dfx + dfy * dfy + dfz * dfz);

    // Ajustar som da fonte
    const maxFountainDistance = 2.5;

    if (distToFountain < maxFountainDistance) {
      const attenuationFountain = 1 - Math.pow(distToFountain / maxFountainDistance, 2);
      const fountainVolume = Math.max(0, 0.3 * attenuationFountain);

      if (this.sounds.fountain) {
        if (fountainVolume > 0.03) {
          this.sounds.fountain.audio.volume = fountainVolume;

          if (!this.sounds.fountain.isPlaying) {
            this.play("fountain");
          }
        } else {
          this.stop("fountain");
        }
      }
    } else {
      this.stop("fountain");
    }
  }

  stopAllAudio() {
    // Para todos os sons registrados, exceto "pole"
    Object.keys(this.sounds).forEach((id) => {
      if (id !== "pole" && this.sounds[id] && this.sounds[id].isPlaying) {
        // Parar som imediatamente (sem fade)
        this.sounds[id].audio.pause();
        this.sounds[id].audio.currentTime = 0;
        this.sounds[id].isPlaying = false;
      }
    });

    // Garantir explicitamente que sons críticos estão parados
    const criticalSounds = [
      "ambient",
      "orb",
      "fountain",
      "portal",
      "mirror",
      "atm",
      "scroll",
    ];

    criticalSounds.forEach((id) => {
      if (id !== "pole" && this.sounds[id]) {
        this.sounds[id].audio.pause();
        this.sounds[id].audio.currentTime = 0;
        this.sounds[id].isPlaying = false;
      }
    });
  }

  // Pré-carregar todos os sons para melhor performance
  preloadAll() {
    Object.keys(this.sounds).forEach((id) => {
      const sound = this.sounds[id];
      sound.audio.load();
    });
  }

  // NOVO: Método para notificar o AudioManager que o loading está completo
  notifyLoadingComplete() {
    this.isLoadingComplete = true;
    console.log('AudioManager: Loading marcado como completo via método');

    // Verifica se há solicitações pendentes de reprodução
    if (this._ambientRequested && this.hasUserInteraction) {
      this.startAmbient();
    }

    // Dispara evento global (útil para outros componentes)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('audio-ready'));
    }
  }
}

// Exportar uma instância única para toda a aplicação
const audioManager = new AudioManager();

// Expor o audioManager globalmente para facilitar o acesso de qualquer componente
if (typeof window !== 'undefined') {
  window.audioManager = audioManager;
}

export default audioManager;