import { LoadingManager } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class AssetsLoadingManager {
  constructor() {
    // Lista de modelos a carregar
    this.assets = {
      models: []
    };

    // Rastreie os modelos carregados
    this.loadedAssets = {
      models: {}
    };

    // Estado do loading
    this.loaded = false;
    this.progress = 0;
    this.itemsLoaded = 0;
    this.itemsTotal = 0;

    this.audioBlocked = true;

    // Callbacks
    this.onProgress = null;
    this.onLoad = null;
    this.onError = null;

    this.manager = new LoadingManager();
    this.setupLoaders();

    if (typeof window !== 'undefined') {
      window.audioLoadingBlocked = true;
    }
  }

  setupLoaders() {
    // Configura os callbacks do LoadingManager
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.itemsTotal = itemsTotal;

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-start', {
        detail: { url, itemsLoaded, itemsTotal }
      }));

      this._blockAudio();

      if (this.onStart) this.onStart(url, itemsLoaded, itemsTotal);
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded;
      this.progress = (itemsLoaded / itemsTotal) * 100;

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-progress', {
        detail: { progress: this.progress, url, itemsLoaded, itemsTotal }
      }));

      if (this.onProgress) this.onProgress(this.progress, url);
    };

    this.manager.onLoad = () => {
      this.loaded = true;

      window.dispatchEvent(new CustomEvent('loading-complete'));

      // IMPORTANTE: NÃO libera o áudio aqui - isso deve acontecer após interação do usuário

      if (this.onLoad) this.onLoad();
    };

    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);

      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      if (this.onError) this.onError(url);
    };

    this.gltfLoader = new GLTFLoader(this.manager);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  _blockAudio() {
    this.audioBlocked = true;

    if (typeof window !== 'undefined') {
      window.audioLoadingBlocked = true;

      if (window.audioManager) {
        if (typeof window.audioManager.stopAllAudio === 'function') {
          window.audioManager.stopAllAudio();
        }

        if (window.audioManager.isLoadingComplete !== undefined) {
          window.audioManager.isLoadingComplete = false;
        }
      }
    }
  }

  _unblockAudio() {
    this.audioBlocked = false;

    if (typeof window !== 'undefined') {
      window.audioLoadingBlocked = false;

      if (window.audioManager) {
        if (typeof window.audioManager.notifyLoadingComplete === 'function') {
          window.audioManager.notifyLoadingComplete();
        } else {
          window.audioManager.isLoadingComplete = true;
        }
      }
    }
  }

  addModel(url, name) {
    this.assets.models.push({ url, name });
    return this;
  }

  startLoading() {
    this._blockAudio();

    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }

    if (this.assets.models.length === 0) {
      setTimeout(() => {
        this.loaded = true;
        window.dispatchEvent(new CustomEvent('loading-complete'));
        if (this.onLoad) this.onLoad();
        // NOTA: Ainda mantém o áudio bloqueado até interação do usuário
      }, 500);
      return;
    }

    // Carrega todos os modelos
    this.assets.models.forEach(model => {
      this.gltfLoader.load(
        model.url,
        (gltf) => {
          this.loadedAssets.models[model.name] = gltf;
        },
        // Callback de progresso
        (xhr) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
          }
        },
        // Callback de erro
        (error) => {
          console.error(`Erro ao carregar modelo ${model.name}:`, error);
        }
      );
    });

    // Adiciona timeout de segurança para forçar a conclusão após 10 segundos
    setTimeout(() => {
      if (!this.loaded) {
        console.warn('Forçando conclusão do carregamento após timeout');
        this.loaded = true;

        // Dispara eventos de conclusão
        window.dispatchEvent(new CustomEvent('loading-complete'));

        if (this.onLoad) this.onLoad();
      }
    }, 10000);
  }

  handleUserInteraction() {
    this.loaded = true;

    this._unblockAudio();

    console.log('AssetsLoadingManager: Áudio liberado após interação do usuário');
    return true;
  }

  getModel(name) {
    return this.loadedAssets.models[name];
  }

  isLoaded() {
    return this.loaded;
  }

  isAudioBlocked() {
    return this.audioBlocked;
  }
}

export default AssetsLoadingManager;