// LoadingManager.js - Versão ultra simplificada
import { LoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

class AssetsLoadingManager {
  constructor() {
    this.assets = { models: [] };
    this.loadedAssets = { models: {} };
    this.loaded = false;

    // Configurar o loader básico
    this.manager = new LoadingManager();
    this.setupLoaders();

    // Flag para primeira visita
    this.firstVisit = !localStorage.getItem('hasVisited');
    if (this.firstVisit) {
      localStorage.setItem('hasVisited', 'true');
    }
  }

  setupLoaders() {
    // Configurar Draco para descompressão eficiente
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    // Configurar GLTF loader
    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Quando todos assets forem carregados
    this.manager.onLoad = () => {
      this.loaded = true;
      window.dispatchEvent(new CustomEvent('loading-complete'));
      if (this.onLoad) this.onLoad();
    };

    // Em caso de erro
    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);
    };
  }

  addModel(url, name) {
    this.assets.models.push({ url, name });
    return this;
  }

  startLoading() {
    // Se não houver modelos para carregar
    if (this.assets.models.length === 0) {
      this.loaded = true;
      window.dispatchEvent(new CustomEvent('loading-complete'));
      if (this.onLoad) this.onLoad();
      return;
    }

    // CRÍTICO: Certificar-se que áudio está mudo durante carregamento
    if (window.audioManager) {
      // Desativar completamente o audioManager durante o carregamento
      window.audioManager.muteAll = true;
    }

    // Carregar modelos de forma simples
    this.assets.models.forEach(model => {
      this.gltfLoader.load(
        model.url,
        (gltf) => {
          this.loadedAssets.models[model.name] = gltf;
        },
        null, // Sem callback de progresso
        (error) => console.error(`Erro ao carregar ${model.name}:`, error)
      );
    });
  }

  isLoaded() {
    return this.loaded;
  }
}

export default AssetsLoadingManager;