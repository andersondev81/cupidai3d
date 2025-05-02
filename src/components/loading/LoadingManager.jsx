// LoadingManager.js - Versão corrigida para o Vercel
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
    // Configura os callbacks do LoadingManager
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Iniciando carregamento: ${url}`);
      this.itemsTotal = itemsTotal;

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-start', {
        detail: { url, itemsLoaded, itemsTotal }
      }));

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
      console.log('Carregamento completo!');

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-complete'));

      if (this.onLoad) this.onLoad();
    };

    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      if (this.onError) this.onError(url);
    };

    // GLTF sem DRACO - vamos evitar usar o DRACO para simplificar
    this.gltfLoader = new GLTFLoader(this.manager);

    // Se quiser usar DRACO de forma segura, use o CDN:
    const dracoLoader = new DRACOLoader();

    // Use o CDN do three.js para carregar os arquivos do DRACO
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    // Importante: definir o tipo de worker
    dracoLoader.setDecoderConfig({ type: 'js' });

    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  // Registro de modelos para carregamento
  addModel(url, name) {
    this.assets.models.push({ url, name });
    return this;
  }

  // Método principal para iniciar o carregamento
  startLoading() {
    console.log('Iniciando carregamento de modelos...');

    // Mostra a tela de loading se existir
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }

    // Se não há modelos para carregar, considere como carregado
    if (this.assets.models.length === 0) {
      setTimeout(() => {
        this.loaded = true;
        window.dispatchEvent(new CustomEvent('loading-complete'));
        if (this.onLoad) this.onLoad();
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
            console.log(`${model.name}: ${Math.round(percentComplete)}% carregado`);
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
    }, 10000); // 10 segundos
  }

  // Métodos de acesso aos modelos carregados
  getModel(name) {
    return this.loadedAssets.models[name];
  }

  // Método para verificar se tudo está carregado
  isLoaded() {
    return this.loaded;
  }
}

export default AssetsLoadingManager;