// LoadingManager.jsx - Otimizado para Vercel
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

    // Detectar se é Vercel
    this.isVercel = window.location.hostname.includes('vercel.app');

    // Flag para saber se é primeira visita
    this.isFirstVisit = !localStorage.getItem('hasVisitedSite');

    // Número máximo de tentativas para carregar um recurso
    this.maxRetries = 3;

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

      // Marcar que o site foi visitado após o carregamento completar
      localStorage.setItem('hasVisitedSite', 'true');

      console.log('✅ Carregamento completo!');

      // Validar se os modelos críticos foram carregados
      this._validateCriticalAssets();

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
    this.assets.models.push({ url: finalUrl, originalUrl: url, name, retries: 0 });
    return this;
  }

  // Método para adicionar uma textura ao carregamento
  addTexture(url, name) {
    const finalUrl = this.addCacheBuster(url);
    this.assets.textures.push({ url: finalUrl, originalUrl: url, name, retries: 0 });
    return this;
  }

  // Método para adicionar áudio ao carregamento
  addAudio(url, name) {
    const finalUrl = this.addCacheBuster(url);
    this.assets.audio.push({ url: finalUrl, originalUrl: url, name, retries: 0 });
    return this;
  }

  // Método para adicionar vídeo ao carregamento (pré-carregamento)
  addVideo(url, name) {
    const finalUrl = this.addCacheBuster(url);
    this.assets.videos.push({ url: finalUrl, originalUrl: url, name, retries: 0 });
    return this;
  }

  // Adicionar cache buster para primeira visita
  addCacheBuster(url) {
    // Sempre usar cache buster na primeira visita ou no Vercel
    if (this.isFirstVisit || this.isVercel) {
      // Checar se a URL já tem parâmetros
      const hasParams = url.includes('?');
      const separator = hasParams ? '&' : '?';

      // Adicionar o timestamp como cache buster
      return `${url}${separator}v=${Date.now()}`;
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

  // Validar se todos os assets críticos foram realmente carregados
  _validateCriticalAssets() {
    // Verificar modelos críticos (especialmente o castelo)
    const criticalModels = ['castle', 'clouds'];
    const missingModels = [];

    criticalModels.forEach(modelName => {
      if (!this.loadedAssets.models[modelName] ||
          !this.loadedAssets.models[modelName].scene) {
        missingModels.push(modelName);
      }
    });

    if (missingModels.length > 0) {
      console.warn(`⚠️ Alguns modelos críticos não foram carregados: ${missingModels.join(', ')}`);

      // Tentar forçar o carregamento novamente
      missingModels.forEach(modelName => {
        const modelAsset = this.assets.models.find(model => model.name === modelName);
        if (modelAsset) {
          console.log(`🔄 Tentando forçar o carregamento de ${modelName} usando XHR...`);
          this._forceLoadModel(modelAsset);
        }
      });
    } else {
      console.log("✅ Todos os modelos críticos foram carregados!");
    }
  }

  // Forçar carregamento de modelo usando XHR
  _forceLoadModel(modelAsset) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', modelAsset.url, true);
    xhr.responseType = 'arraybuffer';

    // Definir cabeçalhos para evitar cache
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Expires', '0');

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(`✅ Modelo ${modelAsset.name} forçado com XHR: Sucesso!`);

        // Processar o modelo usando GLTFLoader
        try {
          this.gltfLoader.parse(
            xhr.response,
            '',
            (gltf) => {
              this.loadedAssets.models[modelAsset.name] = gltf;
              console.log(`✅ Modelo ${modelAsset.name} processado com sucesso!`);

              // Notificar que o modelo crítico foi carregado
              window.dispatchEvent(new CustomEvent('critical-model-loaded', {
                detail: { modelName: modelAsset.name }
              }));
            },
            (error) => {
              console.error(`Erro ao processar modelo ${modelAsset.name}:`, error);
            }
          );
        } catch (error) {
          console.error(`Erro ao analisar modelo ${modelAsset.name}:`, error);
        }
      } else {
        console.error(`Erro ao forçar carregamento de ${modelAsset.name}: ${xhr.status}`);
      }
    };

    xhr.onerror = () => {
      console.error(`Erro de rede ao forçar carregamento de ${modelAsset.name}`);
    };

    xhr.send();
  }

  // Tentar recarregar um asset que falhou
  retryLoad(url) {
    // Identificar o tipo de asset baseado na extensão
    if (url.endsWith('.glb') || url.endsWith('.gltf')) {
      // Encontrar o asset na lista de modelos
      const modelAsset = this.assets.models.find(model => model.url === url || model.originalUrl === url);
      if (modelAsset && modelAsset.retries < this.maxRetries) {
        modelAsset.retries++;
        console.log(`Tentativa ${modelAsset.retries}/${this.maxRetries} para: ${modelAsset.name}`);

        // Adicionar um novo cache buster para evitar cache
        const newUrl = modelAsset.originalUrl + `?v=${Date.now()}-retry-${modelAsset.retries}`;

        setTimeout(() => {
          // Para modelos, usar o XHR direto para mais controle
          if (modelAsset.name === 'castle' || modelAsset.name === 'clouds') {
            this._forceLoadModel({...modelAsset, url: newUrl});
          } else {
            this.gltfLoader.load(
              newUrl,
              (gltf) => {
                this.loadedAssets.models[modelAsset.name] = gltf;
                console.log(`✅ Modelo ${modelAsset.name} carregado na tentativa ${modelAsset.retries}`);
              },
              null,
              (error) => console.error(`Falha no retry de ${modelAsset.name}:`, error)
            );
          }
        }, 1000 * modelAsset.retries); // Backoff exponencial
      }
    } else if (url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.webp')) {
      // Tratamento para texturas
      const textureAsset = this.assets.textures.find(tex => tex.url === url || tex.originalUrl === url);
      if (textureAsset && textureAsset.retries < this.maxRetries) {
        textureAsset.retries++;
        const newUrl = textureAsset.originalUrl + `?v=${Date.now()}-retry-${textureAsset.retries}`;

        setTimeout(() => {
          this.textureLoader.load(
            newUrl,
            (texture) => {
              this.loadedAssets.textures[textureAsset.name] = texture;
            }
          );
        }, 1000 * textureAsset.retries);
      }
    }
    // Adicionar tratamento para outros tipos se necessário
  }

  // Pré-carregamento de outros recursos críticos do DOM
  prefetchResources() {
    // Função para criar um link de prefetch no DOM
    const prefetchCriticalAssets = (urls) => {
      urls.forEach(url => {
        // Adicionar um pequeno delay para evitar sobrecarga no início
        setTimeout(() => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = this.addCacheBuster(url);
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);

          // Para modelos 3D, fazer um prefetch mais forte com fetch()
          if (url.endsWith('.glb')) {
            fetch(this.addCacheBuster(url), {
              method: 'GET',
              cache: 'no-cache',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            })
            .then(response => {
              if (response.ok) console.log(`✓ Prefetch para ${url} concluído`);
            })
            .catch(err => console.warn(`Prefetch para ${url} falhou:`, err));
          }
        }, Math.random() * 1000); // Distribuir requisições
      });
    };

    // Lista de recursos críticos para prefetch (priorizar modelos 3D)
    const criticalResources = [
      '/models/Castle.glb',
      '/models/castleClouds.glb',
      '/images/bg1.jpg',
      '/images/bg1.hdr',
      '/images/studio.jpg',
      '/texture/castleColor.webp',
      '/texture/castleRoughnessV1.webp',
      '/texture/castleMetallicV1.webp',
      '/texture/castleHeart_Base_colorAO.webp',
      '/video/tunnel.mp4',
      '/video/water.mp4',
    ];

    // Executar prefetch apenas na primeira visita
    if (this.isFirstVisit || this.isVercel) {
      prefetchCriticalAssets(criticalResources);
    }

    // No Vercel, também pré-carregar scripts críticos
    if (this.isVercel) {
      const script = document.createElement('script');
      script.src = '/leva.js'; // Se você tiver um bundle do Leva separado
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // Iniciar o processo de carregamento
  startLoading() {
    // Verificar se é primeira visita e marcar
    if (!localStorage.getItem('hasVisitedSite')) {
      // Definir temporariamente para evitar que outros carregadores marquem como visitado
      // mas será definido como permanente apenas quando o carregamento for concluído
      sessionStorage.setItem('hasVisitedSite', 'pending');
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
      localStorage.setItem('hasVisitedSite', 'true');
      window.dispatchEvent(new CustomEvent('loading-complete'));
      if (this.onLoad) this.onLoad();
      return;
    }

    // Carregar modelos com prioridade para o castelo
    const castleModel = this.assets.models.find(model => model.name === 'castle');
    if (castleModel) {
      // Carregar o castelo primeiro
      this.gltfLoader.load(
        castleModel.url,
        (gltf) => {
          this.loadedAssets.models[castleModel.name] = gltf;
          console.log(`✅ Modelo principal ${castleModel.name} carregado!`);

          // Carregar os outros modelos depois que o castelo for carregado
          this.assets.models
            .filter(model => model.name !== 'castle')
            .forEach(model => {
              this.gltfLoader.load(
                model.url,
                (gltf) => {
                  this.loadedAssets.models[model.name] = gltf;
                },
                null,
                (error) => console.error(`Erro ao carregar ${model.name}:`, error)
              );
            });
        },
        (xhr) => {
          // Relatório de progresso específico para o castelo
          if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(`Castelo: ${Math.round(percentComplete)}% carregado`);
          }
        },
        (error) => {
          console.error(`Erro ao carregar modelo principal do castelo:`, error);
          // Tentar novamente com XHR para o castelo
          this._forceLoadModel(castleModel);
        }
      );
    } else {
      // Se não tiver castelo específico, carregar todos os modelos normalmente
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
    }

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
    if (this.gltfLoader && this.gltfLoader.dracoLoader) {
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