// LoadingManager.js - Versão simplificada
import { LoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

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

    // Callbacks
    this.onProgress = null;
    this.onLoad = null;
    this.onError = null;

    // Configuração do LoadingManager
    this.manager = new LoadingManager();
    this.setupLoaders();
  }

  setupLoaders() {
    // Configurar Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    // Configurar o GLTF Loader com Draco
    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Configura os callbacks do LoadingManager
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Iniciando carregamento: ${url}`);
      this.itemsTotal = itemsTotal;

      window.dispatchEvent(new CustomEvent('loading-start', {
        detail: { url, itemsLoaded, itemsTotal }
      }));
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded;
      this.progress = (itemsLoaded / itemsTotal) * 100;

      window.dispatchEvent(new CustomEvent('loading-progress', {
        detail: { progress: this.progress, url, itemsLoaded, itemsTotal }
      }));

      if (this.onProgress) this.onProgress(this.progress, url);
    };

    this.manager.onLoad = () => {
      console.log('Carregamento base concluído');
      this.loaded = true;

      // Dispara evento de conclusão
      window.dispatchEvent(new CustomEvent('loading-complete'));

      if (this.onLoad) this.onLoad();
    };

    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);

      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      if (this.onError) this.onError(url);
    };
  }

  addModel(url, name) {
    this.assets.models.push({ url, name });
    return this;
  }

  startLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }

    if (this.assets.models.length === 0) {
      console.log('Nenhum modelo para carregar');
      setTimeout(() => {
        this.loaded = true;
        window.dispatchEvent(new CustomEvent('loading-complete'));
        if (this.onLoad) this.onLoad();
      }, 500);
      return;
    }

    console.log(`Iniciando carregamento de ${this.assets.models.length} modelos`);

    // Carrega todos os modelos
    this.assets.models.forEach(model => {
      console.log(`Carregando modelo: ${model.name} (${model.url})`);

      this.gltfLoader.load(
        model.url,
        (gltf) => {
          console.log(`Modelo carregado com sucesso: ${model.name}`);
          this.loadedAssets.models[model.name] = gltf;
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(`${model.name}: ${percentComplete.toFixed(1)}%`);
          }
        },
        (error) => {
          console.error(`Erro ao carregar modelo ${model.name}:`, error);
        }
      );
    });

    // Timeout de segurança (30 segundos)
    setTimeout(() => {
      if (!this.loaded) {
        console.warn('Forçando conclusão do carregamento após timeout (30s)');
        this.loaded = true;

        window.dispatchEvent(new CustomEvent('loading-complete'));

        if (this.onLoad) this.onLoad();
      }
    }, 30000);
  }

  getModel(name) {
    return this.loadedAssets.models[name];
  }

  isLoaded() {
    return this.loaded;
  }
}

export default AssetsLoadingManager;