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
    this.modelLoadCounter = 0;

    // Callback personalizado para quando TODOS os recursos estiverem carregados
    this.onAllAssetsLoaded = null;

    // Configuração do LoadingManager
    this.manager = new LoadingManager();
    this.setupLoaders();

    // Verificar cache
    this.hasVisited = localStorage.getItem('hasVisited') === 'true';
    this.initCacheSystem();
  }

  // Inicializa o sistema de cache
  initCacheSystem() {
    if (!this.hasVisited) {
      localStorage.setItem('hasVisited', 'true');
    }
  }

  setupLoaders() {
    // Configura o decodificador Draco primeiro
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });

    // Pré-carregamento do decodificador Draco
    this.dracoLoader.preload();

    // Configura os callbacks do LoadingManager
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Iniciando carregamento: ${url}`);
      this.itemsTotal = itemsTotal;

      window.dispatchEvent(new CustomEvent('loading-start', {
        detail: { url, itemsLoaded, itemsTotal }
      }));

      if (this.onStart) this.onStart(url, itemsLoaded, itemsTotal);
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded;
      this.progress = Math.min((itemsLoaded / itemsTotal) * 100, 99);

      console.log(`Progresso: ${this.progress.toFixed(1)}% (${url})`);

      window.dispatchEvent(new CustomEvent('loading-progress', {
        detail: { progress: this.progress, url, itemsLoaded, itemsTotal }
      }));

      if (this.onProgress) this.onProgress(this.progress, url);
    };

    this.manager.onLoad = () => {
      console.log('Loading manager concluiu o carregamento básico');
      // Este evento é disparado pelo Three.js quando os recursos básicos terminam
      // Não marcamos como carregado ainda, vamos verificar se todos os nossos modelos também estão prontos
      this.checkAllModelsLoaded();
    };

    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);

      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      if (this.onError) this.onError(url);
    };

    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  // Verifica se todos os modelos foram carregados corretamente
  checkAllModelsLoaded() {
    console.log(`Verificando modelos: ${this.modelLoadCounter}/${this.assets.models.length}`);

    if (this.modelLoadCounter >= this.assets.models.length) {
      console.log('Todos os modelos carregados com sucesso!');
      this.loaded = true;

      // Dispara o evento de conclusão
      window.dispatchEvent(new CustomEvent('loading-complete'));

      if (this.onLoad) this.onLoad();
      if (this.onAllAssetsLoaded) this.onAllAssetsLoaded();
    }
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
        if (this.onAllAssetsLoaded) this.onAllAssetsLoaded();
      }, 500);
      return;
    }

    console.log(`Iniciando carregamento de ${this.assets.models.length} modelos`);

    // Resetar contador para novo carregamento
    this.modelLoadCounter = 0;

    // Carrega todos os modelos
    this.assets.models.forEach(model => {
      console.log(`Carregando modelo: ${model.name} (${model.url})`);

      this.gltfLoader.load(
        model.url,
        (gltf) => {
          console.log(`Modelo carregado com sucesso: ${model.name}`);
          this.loadedAssets.models[model.name] = gltf;
          this.modelLoadCounter++;
          this.checkAllModelsLoaded();
        },
        // Callback de progresso
        (xhr) => {
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(`${model.name}: ${percentComplete.toFixed(1)}%`);
          }
        },
        // Callback de erro
        (error) => {
          console.error(`Erro ao carregar modelo ${model.name}:`, error);
          // Incrementa o contador mesmo em caso de erro para não travar o carregamento
          this.modelLoadCounter++;
          this.checkAllModelsLoaded();
        }
      );
    });

    // Adiciona timeout de segurança (aumentado para 20 segundos)
    setTimeout(() => {
      if (!this.loaded) {
        console.warn('Forçando conclusão do carregamento após timeout (20s)');
        this.loaded = true;

        // Dispara eventos de conclusão
        window.dispatchEvent(new CustomEvent('loading-complete'));

        if (this.onLoad) this.onLoad();
        if (this.onAllAssetsLoaded) this.onAllAssetsLoaded();
      }
    }, 20000);
  }

  getModel(name) {
    return this.loadedAssets.models[name];
  }

  isLoaded() {
    return this.loaded;
  }

  // Obtém o progresso atual de carregamento
  getProgress() {
    // Cálculo ponderado: progresso do manager + progresso dos modelos
    if (this.assets.models.length === 0) return 100;

    const managerProgress = this.progress;
    const modelsProgress = (this.modelLoadCounter / this.assets.models.length) * 100;

    // Média ponderada
    return (managerProgress * 0.4) + (modelsProgress * 0.6);
  }
}

export default AssetsLoadingManager;