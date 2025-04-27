// LoadingManager.js - Versão otimizada para Vercel
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
    // Configurando Draco para descompressão
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });

    // Pré-carregue o decodificador Draco
    this.dracoLoader.preload();

    // Configurar o GLTF Loader com Draco
    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // Tracking de loading
    let mainLoadingCompleted = false;
    let modelsLoadedCount = 0;
    const totalModelsToLoad = () => this.assets.models.length;

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

      console.log(`Progresso: ${this.progress.toFixed(0)}% (${url})`);

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-progress', {
        detail: { progress: this.progress, url, itemsLoaded, itemsTotal }
      }));

      if (this.onProgress) this.onProgress(this.progress, url);
    };

    this.manager.onLoad = () => {
      console.log('LoadingManager base concluído');
      mainLoadingCompleted = true;

      // Se todos os modelos estiverem carregados, finaliza o carregamento
      if (modelsLoadedCount >= totalModelsToLoad()) {
        this.finalizeLoading();
      }
    };

    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);

      // Dispatcha evento para a UI
      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      if (this.onError) this.onError(url);
    };

    // Adiciona método personalizado para finalizar o carregamento
    this.finalizeLoading = () => {
      if (!this.loaded) {
        console.log('Todos assets carregados com sucesso');
        this.loaded = true;

        window.dispatchEvent(new CustomEvent('loading-complete'));

        if (this.onLoad) this.onLoad();
      }
    };

    // Método para verificar model load
    this.checkModelLoad = () => {
      modelsLoadedCount++;
      console.log(`Modelo carregado ${modelsLoadedCount}/${totalModelsToLoad()}`);

      if (mainLoadingCompleted && modelsLoadedCount >= totalModelsToLoad()) {
        this.finalizeLoading();
      }
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

    // Reseta o status de carregamento
    this.loaded = false;

    // Primeiro pré-buscar (prefetch) os recursos críticos
    // Isso é crucial para o Vercel, pois ajuda a preparar os recursos
    this.prefetchResources().then(() => {
      // Depois da pré-busca, carrega os modelos de verdade
      this.loadAllModels();
    });

    // Adiciona timeout de segurança (20 segundos)
    setTimeout(() => {
      if (!this.loaded) {
        console.warn('Forçando conclusão do carregamento após timeout (20s)');
        this.loaded = true;

        // Dispara eventos de conclusão
        window.dispatchEvent(new CustomEvent('loading-complete'));

        if (this.onLoad) this.onLoad();
      }
    }, 20000);
  }

  // Pré-busca de recursos críticos (crucial para o Vercel)
  prefetchResources() {
    return new Promise((resolve) => {
      console.log('Pré-buscando recursos críticos...');

      // Lista de URLs críticas a serem pré-buscadas
      const criticalUrls = [
        '/models/Castle.glb',
        '/models/castleClouds.glb',
        '/texture/castleColor.webp',
        '/texture/castleRoughnessV1.webp',
        '/images/bg1.jpg'
      ];

      let preloaded = 0;

      criticalUrls.forEach(url => {
        const request = new XMLHttpRequest();
        request.open('HEAD', url, true);
        request.onload = () => {
          preloaded++;
          if (preloaded === criticalUrls.length) {
            console.log('Pré-busca concluída!');
            resolve();
          }
        };
        request.onerror = () => {
          console.warn(`Erro na pré-busca: ${url}`);
          preloaded++;
          if (preloaded === criticalUrls.length) {
            console.log('Pré-busca concluída com alguns erros');
            resolve();
          }
        };
        request.send();
      });

      // Resolva após um curto período mesmo se as requisições falharem
      setTimeout(resolve, 2000);
    });
  }

  // Carrega todos os modelos
  loadAllModels() {
    // Carrega todos os modelos
    this.assets.models.forEach(model => {
      console.log(`Carregando modelo: ${model.name} (${model.url})`);

      this.gltfLoader.load(
        model.url,
        (gltf) => {
          console.log(`Modelo carregado com sucesso: ${model.name}`);

          // Prepara os materiais e texturas do modelo
          gltf.scene.traverse((child) => {
            if (child.isMesh && child.material) {
              // Força atualização dos materiais
              child.material.needsUpdate = true;

              // Se tiver textura, força atualização também
              if (child.material.map) {
                child.material.map.needsUpdate = true;
              }
            }
          });

          // Armazena o modelo carregado
          this.loadedAssets.models[model.name] = gltf;

          // Verifica se todos os modelos foram carregados
          this.checkModelLoad();
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

          // Incrementa contador mesmo em caso de erro
          this.checkModelLoad();
        }
      );
    });
  }

  getModel(name) {
    return this.loadedAssets.models[name];
  }

  isLoaded() {
    return this.loaded;
  }

  getProgress() {
    return this.progress;
  }
}

export default AssetsLoadingManager;