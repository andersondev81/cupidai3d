// LoadingManager.jsx - Sistema de carregamento para Three.js
import { LoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { TextureLoader } from 'three';
import { AudioLoader } from 'three';

class AssetsLoadingManager {
  constructor() {
    // Estrutura para armazenar todos os tipos de assets
    this.assets = {
      models: [],
      textures: [],
      audio: [],
      videos: []
    };

    // Estrutura para armazenar os assets carregados
    this.loadedAssets = {
      models: {},
      textures: {},
      audio: {},
      videos: {}
    };

    // Controle de progresso
    this.loaded = false;
    this.progress = 0;
    this.totalItems = 0;
    this.loadedItems = 0;

    // Configurar o manager principal
    this.manager = new LoadingManager();
    this.setupManager();
    this.setupLoaders();

    // Cache buster para primeira visita
    this.cacheBuster = `?v=${Date.now()}`;

    // Pre-fetch recursos críticos do DOM
    this.prefetchResources();
  }

  setupManager() {
    // Quando item começa a carregar
    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.totalItems = itemsTotal;
      console.log(`Iniciando: ${url}. Itens carregados: ${itemsLoaded}/${itemsTotal}`);
    };

    // Durante o progresso
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.loadedItems = itemsLoaded;
      this.progress = itemsLoaded / itemsTotal;

      // Disparar evento com progresso preciso
      window.dispatchEvent(new CustomEvent('loading-progress', {
        detail: {
          progress: this.progress,
          loaded: itemsLoaded,
          total: itemsTotal,
          url: url
        }
      }));

      console.log(`Carregando: ${url}. Progresso: ${Math.round(this.progress * 100)}%`);
    };

    // Quando tudo estiver carregado
    this.manager.onLoad = () => {
      this.loaded = true;
      this.progress = 1;

      console.log('✅ Carregamento completo!');

      // Despachar evento de carregamento concluído
      window.dispatchEvent(new CustomEvent('loading-complete'));

      // Executar callback personalizado se definido
      if (this.onLoad) this.onLoad();
    };

    // Em caso de erro
    this.manager.onError = (url) => {
      console.error(`❌ Erro ao carregar: ${url}`);

      // Despachar evento de erro
      window.dispatchEvent(new CustomEvent('loading-error', {
        detail: { url }
      }));

      // Tentar carregar novamente uma vez
      this.retryLoad(url);
    };
  }

  setupLoaders() {
    // Configurar DRACOLoader para modelos comprimidos
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    // Configurar GLTFLoader com suporte a DRACO
    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Loaders para outros tipos de assets
    this.textureLoader = new TextureLoader(this.manager);
    this.audioLoader = new AudioLoader(this.manager);
  }

  // Método para adicionar um model ao carregamento
  addModel(url, name) {
    // Adicionar cache buster para forçar carregamento na primeira visita
    const finalUrl = this.addCacheBuster(url);
    this.assets.models.push({ url: finalUrl, originalUrl: url, name });
    return this;
  }

  // Método para adicionar uma textura ao carregamento
  addTexture(url, name) {
    const finalUrl = this.addCacheBuster(url);
    this.assets.textures.push({ url: finalUrl, originalUrl: url, name });
    return this;
  }

  // Método para adicionar áudio ao carregamento
  addAudio(url, name) {
    const finalUrl = this.addCacheBuster(url);
    this.assets.audio.push({ url: finalUrl, originalUrl: url, name });
    return this;
  }

  // Método para adicionar vídeo ao carregamento (pré-carregamento)
  addVideo(url, name) {
    const finalUrl = this.addCacheBuster(url);
    this.assets.videos.push({ url: finalUrl, originalUrl: url, name });
    return this;
  }

  // Adicionar cache buster para primeira visita
  addCacheBuster(url) {
    // Verificar se é primeira visita
    if (!localStorage.getItem('hasVisitedSite')) {
      return `${url}${this.cacheBuster}`;
    }
    return url;
  }

  // Pré-carregamento de vídeos
  preloadVideo(url, name) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.crossOrigin = 'anonymous';

      // Evento para quando estiver disponível para reprodução
      video.oncanplaythrough = () => {
        this.loadedAssets.videos[name] = video;
        this.loadedItems++;
        this.progress = this.loadedItems / this.totalItems;

        window.dispatchEvent(new CustomEvent('loading-progress', {
          detail: {
            progress: this.progress,
            loaded: this.loadedItems,
            total: this.totalItems,
            url: url
          }
        }));

        resolve(video);
      };

      // Evento para erros
      video.onerror = (err) => {
        console.error(`Erro ao carregar vídeo ${url}:`, err);
        reject(err);
      };

      // Iniciar carregamento
      video.src = url;
      video.load();
    });
  }

  // Tentar recarregar um asset que falhou
  retryLoad(url) {
    // Implementar lógica de retry aqui
    console.log(`Tentando carregar novamente: ${url}`);

    // Identificar o tipo de asset baseado na extensão
    if (url.endsWith('.glb') || url.endsWith('.gltf')) {
      // Encontrar o asset na lista de modelos
      const modelAsset = this.assets.models.find(model => model.url === url || model.originalUrl === url);
      if (modelAsset) {
        setTimeout(() => {
          this.gltfLoader.load(
            modelAsset.url,
            (gltf) => {
              this.loadedAssets.models[modelAsset.name] = gltf;
            },
            null,
            (error) => console.error(`Falha no retry de ${modelAsset.name}:`, error)
          );
        }, 1000); // Pequeno delay antes do retry
      }
    }
    // Adicionar outros tipos conforme necessário
  }

  // Pré-carregamento de outros recursos críticos do DOM
  prefetchResources() {
    // Criar um link de prefetch para iniciar carregamento de recursos importantes
    const prefetchCriticalAssets = (urls) => {
      urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });
    };

    // Lista de recursos críticos para prefetch
    const criticalResources = [
      '/images/bg1.jpg',
      '/images/bg1.hdr',
      '/images/studio.jpg',
      '/texture/castleColor.webp',
      // Adicione mais recursos críticos aqui
    ];

    prefetchCriticalAssets(criticalResources);
  }

  // Iniciar o processo de carregamento
  startLoading() {
    // Verificar se é primeira visita e marcar
    if (!localStorage.getItem('hasVisitedSite')) {
      localStorage.setItem('hasVisitedSite', 'true');
    }

    // Garantir que áudio está mudo durante carregamento
    if (window.audioManager) {
      window.audioManager.muteAll = true;
      if (window.audioManager.stopAll) {
        window.audioManager.stopAll();
      }
    }

    // Calcular total de itens
    this.totalItems =
      this.assets.models.length +
      this.assets.textures.length +
      this.assets.audio.length +
      this.assets.videos.length;

    if (this.totalItems === 0) {
      // Se não houver assets, marcar como carregado
      this.loaded = true;
      window.dispatchEvent(new CustomEvent('loading-complete'));
      if (this.onLoad) this.onLoad();
      return;
    }

    // Carregar modelos
    this.assets.models.forEach(model => {
      this.gltfLoader.load(
        model.url,
        (gltf) => {
          this.loadedAssets.models[model.name] = gltf;
        },
        null,
        (error) => console.error(`Erro ao carregar ${model.name}:`, error)
      );
    });

    // Carregar texturas
    this.assets.textures.forEach(texture => {
      this.textureLoader.load(
        texture.url,
        (loadedTexture) => {
          this.loadedAssets.textures[texture.name] = loadedTexture;
        }
      );
    });

    // Carregar áudio
    this.assets.audio.forEach(audio => {
      this.audioLoader.load(
        audio.url,
        (buffer) => {
          this.loadedAssets.audio[audio.name] = buffer;
        }
      );
    });

    // Pré-carregar vídeos
    this.assets.videos.forEach(video => {
      this.preloadVideo(video.url, video.name)
        .catch(err => console.error(`Erro no pré-carregamento do vídeo ${video.name}:`, err));
    });
  }

  // Verificar se todos os assets foram carregados
  isLoaded() {
    return this.loaded;
  }

  // Obter progresso atual
  getProgress() {
    return this.progress;
  }

  // Liberar memória
  dispose() {
    // Limpar loaders
    if (this.gltfLoader.dracoLoader) {
      this.gltfLoader.dracoLoader.dispose();
    }

    // Limpar referências
    this.gltfLoader = null;
    this.textureLoader = null;
    this.audioLoader = null;

    // Limpar manager
    this.manager = null;
  }
}

export default AssetsLoadingManager;