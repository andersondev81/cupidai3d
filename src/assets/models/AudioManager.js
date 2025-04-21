// AudioManager.js
// Um sistema completo para gerenciar áudio na aplicação Cupid's Church

// Importar THREE.js se estiver disponível no contexto do navegador

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
    // Posições dos elementos para áudio espacial usando nossa classe Position
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

    // Flag para verificar se o navegador permite reprodução automática
    this.canAutoplay = false;

    // Verificar se o áudio pode ser reproduzido automaticamente
    this.checkAutoplay();
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
        // this.registerSound('nav', '../sounds/camerawoosh.MP3', {
        //   loop: false,
        //   volume: 0.1,
        // });
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
        .catch((error) => {
          this.canAutoplay = false;
        });
    }
  }

  // Registrar um novo som no gerenciador
  registerSound(id, path, options = {}) {
    const audio = new Audio();
    audio.src = path;
    audio.volume = options.volume || this.volume;

    // Configurar loop explicitamente - por padrão, todos (exceto transição) em loop
    // const shouldLoop =
    //   id === "transition" || id === "click" || id === "hover"
    //     ? false
    //     : options.loop !== undefined
    //     ? options.loop
    //     : true;

    audio.loop = false;

    // console.log(
    //   `Registrando som: ${id}, loop: ${audio.loop}, volume: ${audio.volume}`
    // );

    this.sounds[id] = {
      audio: audio,
      volume: options.volume || this.volume,
      isPlaying: false,
      loop: false,
    };

    // Configurar o evento de fim da reprodução
    // audio.addEventListener("ended", () => {
    //   // Se não for loop, marcar como não tocando mais
    //   if (!shouldLoop) {
    //     this.sounds[id].isPlaying = false;
    //   }
    // });
  }

  // Reproduzir um som específico
  play(id) {
    if (this.isMuted || !this.sounds[id]) return;

    const sound = this.sounds[id];

    // Se o som for "pole", garantir que ele toque em loop
    // if (id === "pole") {
    //   sound.audio.loop = true;
    // } else {
    //   // Para todos os outros sons, desativar o loop
    //   sound.audio.loop = false;
    // }



    sound.audio.loop = false
    if (id === "pole") {
      sound.audio.loop = true;
    }
    // Se já estiver tocando, não faça nada para evitar reinício
    // Exceto para sons sem loop (transition, click, hover)
    // if (sound.isPlaying) {
    //   if (!sound.loop) {
    //     sound.audio.currentTime = 0;
    //   } else {
    //     // Já está tocando em loop, não faça nada
    //     return;
    //   }
    // }

    // Marcar como tocando e iniciar a reprodução
    sound.isPlaying = true;
    sound.audio.volume = sound.volume;

    // Usar Promise para compatibilidade com diferentes navegadores
    const playPromise = sound.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        sound.isPlaying = false;
        // console.error(`Erro ao reproduzir o som ${id}:`, error);
      });
    }
  }

  // Parar um som específico
  stop(id) {
    if (!this.sounds[id]) return;

    // Do not stop the "pole" sound
    if (id === "pole") {
      return;
    }

    const sound = this.sounds[id];
    if (sound.isPlaying) {
      sound.audio.pause();
      sound.audio.currentTime = 0;
      sound.isPlaying = false;
    }
  }

  // Pausar um som específico (mantém o estado, apenas interrompe a reprodução)
  pause(id) {
    if (!this.sounds[id]) return;

    const sound = this.sounds[id];
    if (sound.isPlaying) {
      sound.audio.pause();
    }
  }

  // Retomar a reprodução de um som pausado com fade-in suave
  resume(id) {
    if (this.isMuted || !this.sounds[id]) return;

    const sound = this.sounds[id];
    if (sound.isPlaying) {
      // Se ainda está marcado como "tocando", é porque foi pausado
      // Iniciar com volume zero para fade-in suave
      sound.audio.volume = 0;

      const playPromise = sound.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Fade-in de volume - mais suave na transição
            const fadeDuration = 1000; // 1 segundo para fade-in
            const fadeSteps = 20; // Número de passos durante o fade
            const volumeIncrement = sound.volume / fadeSteps;
            const stepDuration = fadeDuration / fadeSteps;

            let currentStep = 0;
            const fadeInterval = setInterval(() => {
              currentStep++;
              const newVolume = Math.min(
                sound.volume,
                currentStep * volumeIncrement
              );
              sound.audio.volume = newVolume;

              if (currentStep >= fadeSteps) {
                clearInterval(fadeInterval);
                sound.audio.volume = sound.volume; // Garantir volume final correto
              }
            }, stepDuration);

          })
          .catch((error) => {
            console.error(`Erro ao retomar o som ${id}:`, error);
          });
      }
    } else {
      // Se não estiver marcado como tocando, iniciar normalmente
      this.play(id);
    }
  }

  // Método para desvanecimento suave de um som (fade-out)
  fadeOut(id, duration = 1000) {
    if (!this.sounds[id] || !this.sounds[id].isPlaying) return;

    const sound = this.sounds[id];
    const originalVolume = sound.audio.volume;
    const fadeSteps = 20; // Número de passos durante o fade
    const volumeDecrement = originalVolume / fadeSteps;
    const stepDuration = duration / fadeSteps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(
        0,
        originalVolume - currentStep * volumeDecrement
      );
      sound.audio.volume = newVolume;

      if (currentStep >= fadeSteps) {
        clearInterval(fadeInterval);
        // Após o fade, para ou pausa o som dependendo do que for necessário
        if (sound.loop) {
          // Se for um som em loop, apenas pause para poder retomar depois
          sound.audio.pause();
        } else {
          // Se não for loop, pode parar completamente
          sound.audio.pause();
          sound.audio.currentTime = 0;
          sound.isPlaying = false;
        }
        // Restaurar o volume original para quando tocar novamente
        sound.audio.volume = originalVolume;
      }
    }, stepDuration);

    return fadeInterval; // Retorna o ID do intervalo para poder cancelá-lo se necessário
  }

  // Método para desvanecimento suave seguido de reprodução de um novo som
  crossFade(fromId, toId, duration = 1000) {
    if (!this.sounds[fromId] || !this.sounds[toId]) return;

    // Iniciar fade-out do som atual
    this.fadeOut(fromId, duration);

    // Iniciar o próximo som com fade-in após metade do tempo de fade-out
    setTimeout(() => {
      // Configurar volume inicial como 0
      if (this.sounds[toId]) {
        this.sounds[toId].audio.volume = 0;
        this.play(toId);

        // Aplicar fade-in
        const fadeSteps = 20;
        const targetVolume = this.sounds[toId].volume;
        const volumeIncrement = targetVolume / fadeSteps;
        const stepDuration = duration / 2 / fadeSteps;

        let currentStep = 0;
        const fadeInterval = setInterval(() => {
          currentStep++;
          const newVolume = Math.min(
            targetVolume,
            currentStep * volumeIncrement
          );
          if (this.sounds[toId] && this.sounds[toId].audio) {
            this.sounds[toId].audio.volume = newVolume;
          }

          if (currentStep >= fadeSteps) {
            clearInterval(fadeInterval);
            if (this.sounds[toId] && this.sounds[toId].audio) {
              this.sounds[toId].audio.volume = targetVolume; // Garantir volume final correto
            }
          }
        }, stepDuration);
      }
    }, duration / 2);
  }

  // Reproduzir som de transição para uma seção específica
  playTransitionSound(sectionName) {
    // Primeiro reproduz o som genérico de transição
    this.play("transition");

    // Depois reproduz o som específico da seção, se existir
    if (this.sounds[sectionName]) {
      setTimeout(() => {
        this.play(sectionName);
      }, 300); // Pequeno atraso para não sobrepor imediatamente o som de transição
    }
  }

  // Reproduz som de clique (para botões e interações)
  playClickSound() {
    this.play("click");
  }

  // Reproduz som de hover (para feedbacks ao passar mouse sobre elementos interativos)
  playHoverSound() {
    this.play("hover");
  }

  // Iniciar áudio ambiente
  startAmbient() {
    // console.log("playig ambient");
    this.play("ambient");
  }

  // Parar áudio ambiente
  stopAmbient() {
    this.stop("ambient");
  }

  // Ativar/desativar mudo
  toggleMute() {
    this.isMuted = !this.isMuted;

    // Aplicar estado de mudo a todos os sons
    Object.keys(this.sounds).forEach((id) => {
      this.sounds[id].audio.muted = this.isMuted;
    });

    return this.isMuted;
  }

  // Método para pausar todos os sons exceto os ambientes
  pauseAllExceptAmbient() {
    const ambientSounds = this.soundCategories.ambient || [
      "ambient",
      "water",
      "fountain",
      "orb",
      "pole",
    ];

    Object.keys(this.sounds).forEach((id) => {
      // Não pausa sons ambientes
      if (!ambientSounds.includes(id)) {
        this.pause(id);
      }
    });
  }

  // Método para pausar todos os sons exceto os de uma categoria específica
  pauseAllExcept(category) {
    Object.keys(this.sounds).forEach((id) => {
      if (this.soundToCategory[id] !== category) {
        this.pause(id);
      }
    });
  }

  // Para o som associado a uma seção específica
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

  // Para todos os sons de seção (utilizados durante transições)
  stopAllSectionSounds() {
    // Lista de todas as seções
    const sections = [
      "nav",
      "about",
      "aidatingcoach",
      "download",
      "token",
      "roadmap",
    ];

    // Para os sons de cada seção
    sections.forEach((section) => {
      this.stopSectionSounds(section);
    });

    // Para sons adicionais que podem estar tocando, exceto "pole"
    ["transition", "mirror", "atm", "scroll", "coins", "paper"].forEach(
      (sound) => {
        if (this.sounds[sound] && sound !== "pole") {
          this.stop(sound);
        }
      }
    );

    // Garantir que "pole" continue tocando
    if (this.sounds["pole"] && !this.sounds["pole"].isPlaying) {
      this.play("pole");
    }
  }

  // Método para pausar sons de uma categoria específica
  pauseCategory(category) {
    const soundsInCategory = Object.keys(this.sounds).filter(
      (id) => this.soundToCategory[id] === category
    );

    soundsInCategory.forEach((sound) => {
      this.pause(sound);
    });
  }

  // Método para pausar todos os sons de uma seção específica
  pauseSectionSounds(sectionName) {
    // Pausar o som principal da seção
    if (this.sounds[sectionName]) {
      this.pause(sectionName);
    }

    // Pausar os sons dos elementos da seção
    const sectionElements =
      this.soundCategories.sectionElements[sectionName] || [];
    sectionElements.forEach((element) => {
      if (this.sounds[element]) {
        this.pause(element);
      }
    });
  }

  // Método para reproduzir todos os sons de uma seção específica
  playSectionSounds(sectionName) {
    // Reproduzir o som principal da seção
    if (this.sounds[sectionName]) {
      this.play(sectionName);
    }

    // Reproduzir os sons dos elementos da seção
    const sectionElements =
      this.soundCategories.sectionElements[sectionName] || [];
    sectionElements.forEach((element) => {
      if (this.sounds[element]) {
        this.play(element);
      }
    });
  }

  // Método para gerenciar a transição entre seções
  transitionBetweenSections(fromSection, toSection) {
    // Primeiro, tocar o som de transição
    this.play("transition");

    // Pausar sons da seção anterior (preservando o estado para retomada futura)
    if (fromSection) {
      this.pauseSectionSounds(fromSection);
    }

    // Após um atraso, reproduzir sons da nova seção
    setTimeout(() => {
      this.playSectionSounds(toSection);
    }, 300); // Pequeno atraso para não sobrepor o som de transição
  }

  play(id) {
    // NOVA VERIFICAÇÃO: Se o som for de transição e estiver bloqueado globalmente, não tocar
    if (id === "transition" && window.blockTransitionSound) {
      return;
    }

    if (this.isMuted || !this.sounds[id]) return;

    const sound = this.sounds[id];

    // Garantir que loop esteja configurado corretamente antes de tocar
    sound.audio.loop = false;
    if (id === "pole") {
      sound.audio.loop = true;
    }
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
      playPromise.catch((error) => {
        sound.isPlaying = false;
        // console.error(`Erro ao reproduzir o som ${id}:`, error);
      });
    }
  }

  // Método para atualizar sons espaciais com base na posição da câmera
  updateSpatialSounds = (cameraPosition) => {
    // Verificar se o audioManager está disponível
    if (!window.audioManager) return;

    // Se quiser implementar seus próprios cálculos de áudio espacial em vez
    // de usar o método do AudioManager, você pode usar este código:

    // Coordenadas do orb
    const orbPosition = { x: 1.76, y: 1.155, z: -0.883 };

    // Calcular distância
    const distToOrb = distanceBetween(cameraPosition, orbPosition);

    // Ajustar som do orb
    const maxOrbDistance = 3.5; // Reduzido drasticamente (era 10)

    if (distToOrb < maxOrbDistance) {
      // Atenuação quadrática para queda de volume mais realista
      const attenuation = 1 - Math.pow(distToOrb / maxOrbDistance, 2);
      const orbVolume = Math.max(0, 0.3 * attenuation);

      if (window.audioManager && window.audioManager.sounds.orb) {
        // Aplicar volume apenas se for significativo
        if (orbVolume > 0.01) {
          window.audioManager.sounds.orb.audio.volume = orbVolume;

          if (!window.audioManager.sounds.orb.isPlaying) {
            window.audioManager.play("orb");
          }
        } else {
          window.audioManager.stop("orb");
        }
      }
    } else {
      // Se estiver fora do alcance, parar o som
      if (window.audioManager) {
        window.audioManager.stop("orb");
      }
    }
  };

  // Atualiza o volume de um som específico com base na distância
  updateElementSound(
    soundId,
    cameraPosition,
    maxDistance,
    maxVolume,
    positionKey
  ) {
    // Usar a chave de posição, ou o ID do som se não for fornecida
    const posKey = positionKey || soundId;

    // Verificar se temos a posição e o som
    if (!this.positions[posKey] || !this.sounds[soundId]) return;

    // Calcular a distância entre a câmera e o elemento
    const distance = cameraPosition.distanceTo(this.positions[posKey]);

    // Reduzir significativamente a distância máxima para ouvir o som do orb
    // Usar valores diferentes para diferentes tipos de sons
    let effectiveMaxDistance = maxDistance;
    if (soundId === "orb") {
      effectiveMaxDistance = 2.5; // Reduzir drasticamente para o orb (originalmente 10)
    } else if (soundId === "portal" || soundId === "heartbeat") {
      effectiveMaxDistance = 5; // Menor para sons mais sutis
    } else if (soundId === "fountain") {
      effectiveMaxDistance = 6; // Um pouco maior para a fonte
    }else if (soundId === "pole") {
      effectiveMaxDistance = 6; // Um pouco maior para a fonte
    }

    // Se estiver dentro do alcance, ajuste o volume e toque
    if (distance < effectiveMaxDistance) {
      // Curva de atenuação melhorada: queda quadrática (mais realista)
      // distance/effectiveMaxDistance é uma proporção entre 0 e 1
      // Elevando ao quadrado, obtemos uma queda mais acentuada com a distância
      const attenuation = 1 - Math.pow(distance / effectiveMaxDistance, 2);
      const volume = Math.max(0, maxVolume * attenuation);

      // Log para debug (pode ser removido na versão final)
      // console.log(`${soundId}: distância=${distance.toFixed(2)}, volume=${volume.toFixed(2)}`);

      // Aplicar apenas se o volume for significativo (evitar sons muito baixos)
      if (volume > 0.01) {
        if (this.sounds[soundId]) {
          this.sounds[soundId].audio.volume = volume;

          if (!this.sounds[soundId].isPlaying) {
            console.log(
              `Iniciando som ${soundId} a ${distance.toFixed(2)} unidades`
            );
            this.play(soundId);
          }
        }
      } else {
        // Volume muito baixo, parar o som
        this.stop(soundId);
      }
    } else {
      // Se estiver fora do alcance, pare o som
      if (this.sounds[soundId] && this.sounds[soundId].isPlaying) {
        this.stop(soundId);
      }
    }
  }

  // Definir volume global
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value)); // Garantir que o valor está entre 0 e 1

    // Aplicar volume a todos os sons, respeitando suas configurações individuais
    Object.keys(this.sounds).forEach((id) => {
      const sound = this.sounds[id];
      const individualVolume = sound.volume || this.volume;
      sound.audio.volume = this.isMuted ? 0 : individualVolume;
    });
  }

  // Definir uma posição para um elemento de áudio
  setElementPosition(elementId, x, y, z) {
    this.positions[elementId] = new Position(x, y, z);
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
    // (mesmo que não estejam marcados como 'isPlaying'), exceto "pole"
    const criticalSounds = [
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
  setupNavigationHandlers() {
    if (typeof window !== 'undefined') {
      // Adicionar método global para parar todos os sons
      window.stopAllSounds = () => this.stopAllAudio();

      // Se o sistema tiver uma função de navegação global, intercepte-a
      if (window.globalNavigation) {
        const originalNavigateTo = window.globalNavigation.navigateTo;

        window.globalNavigation.navigateTo = (sectionName) => {
          // Parar todos os sons antes da navegação
          this.stopAllAudio();

          // Depois chamar a função original
          if (originalNavigateTo) {
            originalNavigateTo(sectionName);
          }
        };
      }

      // Adicionar evento para comandos de return / back
      const handleReturnCommand = () => {
        this.stopAllAudio();
      };

      // Você pode adicionar este evento a botões de retorno específicos também
      // ou adicionar um evento global para detectar navegação
      document.addEventListener('returnToCastle', handleReturnCommand);
    }
  }
  // Pré-carregar todos os sons para melhor performance
  preloadAll() {
    Object.keys(this.sounds).forEach((id) => {
      const sound = this.sounds[id];
      sound.audio.load();
    });
  }
}

// Exportar uma instância única para toda a aplicação
const audioManager = new AudioManager();

// Expor o audioManager globalmente para facilitar o acesso de qualquer componente
window.audioManager = audioManager;

export default audioManager;
