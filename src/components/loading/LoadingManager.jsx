// LoadingManager.js - Versão corrigida e simplificada
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

    // Contador específico para modelos
    this.modelsToLoad = 0;
    this.modelsLoaded = 0;

    // Callbacks
    this.onProgress = null;
    this.onLoad = null;
    this.onError = null;

    // Sistema de cache para primeira visita
    this.firstVisit = !localStorage.getItem('hasVisited');
    if (this.firstVisit) {
      localStorage.setItem('hasVisited', 'true');
    }

    // Configuração do LoadingManager
    this.manager = new LoadingManager();
    this.setupLoaders();
  }

  setupLoaders() {
    // Configurar o Draco loader para decodificar modelos comprimidos
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    // Pré-carregamento do decodificador para melhor desempenho
    dracoLoader.preload();

    // Configurar o GLTF Loader com Draco
    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Configura os callbacks do LoadingManager
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Carregamento iniciado: ${url}`);
      this.itemsTotal = itemsTotal;

      // Dispara evento para a UI
      window.dispatchEvent(new CustomEvent('loading-start', {
        detail: { url, itemsLoaded, itemsTotal }
      }));
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.itemsLoaded = itemsLoaded;
      this.progress = (itemsLoaded / itemsTotal) * 100;

      // Dispara evento para a UI
      window.dispatchEvent(new CustomEvent('loading-progress', {
        detail: { progress: this.progress, url, itemsLoaded, itemsTotal }
      }));

      if (this.onProgress) this.onProgress(this.progress, url);
    };

    this.manager.onLoad = () => {
      console.log('LoadingManager base concluído');

      // Verifica se todos os modelos foram carregados antes de finalizar
      this.checkAllAssetsLoaded();
    };

    this.manager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);

      // Dispara evento para a UI
      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      if (this.onError) this.onError(url);
    };
  }

  // Verifica se todos os assets foram carregados
  checkAllAssetsLoaded() {
    console.log(`Modelos carregados: ${this.modelsLoaded}/${this.modelsToLoad}`);

    if (this.modelsLoaded >= this.modelsToLoad) {
      console.log('Todos os modelos carregados com sucesso');
      this.loaded = true;

      // Dispara evento de conclusão
      window.dispatchEvent(new CustomEvent('loading-complete'));

      if (this.onLoad) this.onLoad();
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

    // Se não houver modelos para carregar, finaliza imediatamente
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

    // Reseta contadores para um novo carregamento
    this.modelsToLoad = this.assets.models.length;
    this.modelsLoaded = 0;

    // Carrega todos os modelos
    this.assets.models.forEach(model => {
      console.log(`Carregando modelo: ${model.name} (${model.url})`);

      this.gltfLoader.load(
        model.url,
        (gltf) => {
          console.log(`Modelo carregado com sucesso: ${model.name}`);

          // Importante: inicializa materiais e geometrias
          gltf.scene.traverse((object) => {
            if (object.isMesh) {
              // Força atualização dos materiais
              if (object.material) {
                object.material.needsUpdate = true;

                // Se tiver textura, força atualização também
                if (object.material.map) {
                  object.material.map.needsUpdate = true;
                }
              }

              // Se tiver geometria, garante que buffers estão atualizados
              if (object.geometry) {
                object.geometry.computeBoundingSphere();
                object.geometry.computeBoundingBox();
              }
            }
          });

          // Armazena o modelo carregado
          this.loadedAssets.models[model.name] = gltf;

          // Incrementa contador e verifica se todos foram carregados
          this.modelsLoaded++;
          this.checkAllAssetsLoaded();
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

          // Incrementa contador mesmo em caso de erro para não travar
          this.modelsLoaded++;
          this.checkAllAssetsLoaded();
        }
      );
    });

    // Timeout de segurança (15 segundos)
    setTimeout(() => {
      if (!this.loaded) {
        console.warn('Forçando conclusão do carregamento após timeout (15s)');
        this.loaded = true;

        // Dispara eventos de conclusão
        window.dispatchEvent(new CustomEvent('loading-complete'));

        if (this.onLoad) this.onLoad();
      }
    }, 15000);
  }

  getModel(name) {
    return this.loadedAssets.models[name];
  }

  isLoaded() {
    return this.loaded;
  }

  getProgress() {
    if (this.modelsToLoad === 0) return 100;

    // Considera tanto o progresso do ThreeJS quanto o contador de modelos
    const threeProgress = this.progress * 0.3;
    const modelProgress = (this.modelsLoaded / this.modelsToLoad) * 0.7;

    return threeProgress + modelProgress;
  }
}

export default AssetsLoadingManager;