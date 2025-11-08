import { createReactiveManager, SaveState } from '../src';

// Entity key constants
const ENTITY = {
  PRODUCT: 'product',
} as const;

// Mock products data
const mockProducts = [
  { id: 'product-1', name: 'トマト', price: 150, description: '新鮮な完熟トマト', version: 1 },
  { id: 'product-2', name: 'にんじん', price: 100, description: '甘くて栄養たっぷり', version: 1 },
  { id: 'product-3', name: 'じゃがいも', price: 80, description: 'ホクホクのじゃがいも', version: 1 },
];

// Product state storage
const productStates = new Map(mockProducts.map(p => [p.id, { ...p }]));

// Create reactive manager
const manager = createReactiveManager({
  defaultDebounceMs: 1000,
});

// Register product entity with mock operations
manager.register(ENTITY.PRODUCT, {
  save: async (data) => {
    console.log(`💾 Saving ${data.name}:`, data);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const updated = {
      ...data,
      version: data.version + 1,
    };
    
    productStates.set(data.id!, updated);
    console.log(`✅ Saved ${data.name}:`, updated);
    return updated;
  },

  delete: async (id) => {
    const product = productStates.get(id);
    console.log(`🗑️ Deleting ${product?.name}:`, id);
    await new Promise(resolve => setTimeout(resolve, 500));
    productStates.delete(id);
    console.log(`✅ Deleted product`);
  },

  check: async (data) => {
    console.log(`🔍 Checking stock for ${data.name}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const inStock = Math.random() > 0.3;
    const result = { inStock, quantity: inStock ? Math.floor(Math.random() * 100) : 0 };
    console.log(`✅ Stock check result for ${data.name}:`, result);
    return result;
  },
});

// DOM elements
const productsContainer = document.getElementById('products-container')!;
const debugEl = document.getElementById('debug')!;
const addProductBtn = document.getElementById('addProductBtn')!;

// Product counter for generating new IDs
let productCounter = mockProducts.length + 1;

// Create product row
function createProductRow(product: typeof mockProducts[0]) {
  const row = document.createElement('tr');
  row.id = `product-${product.id}`;
  
  row.innerHTML = `
    <td>
      <input 
        type="text" 
        class="name-input"
        data-product-id="${product.id}"
        value="${product.name}"
      />
    </td>
    <td>
      <input 
        type="number" 
        class="price-input"
        data-product-id="${product.id}"
        value="${product.price}"
      />
    </td>
    <td>
      <textarea 
        class="description-input"
        data-product-id="${product.id}"
      >${product.description}</textarea>
    </td>
    <td>
      <div class="status" id="status-${product.id}">ready</div>
    </td>
    <td>
      <button class="force-save-btn" data-product-id="${product.id}">Save</button>
      <button class="check-btn" data-product-id="${product.id}">Check</button>
      <button class="delete-btn" data-product-id="${product.id}">Delete</button>
    </td>
  `;
  
  return row;
}

// Update product card status
function updateProductStatus(productId: string, state: SaveState, productName: string) {
  const statusEl = document.getElementById(`status-${productId}`);
  if (!statusEl) return;
  
  switch (state) {
    case SaveState.IDLE:
      statusEl.textContent = 'ready';
      statusEl.style.color = '#5f6368';
      break;
    case SaveState.SAVING:
      statusEl.textContent = 'saving...';
      statusEl.style.color = '#5f6368';
      break;
    case SaveState.SAVED:
      statusEl.textContent = 'saved';
      statusEl.style.color = '#5f6368';
      setTimeout(() => {
        if (statusEl.textContent === 'saved') {
          statusEl.textContent = 'ready';
          statusEl.style.color = '#5f6368';
        }
      }, 2000);
      break;
    case SaveState.ERROR:
      statusEl.textContent = 'error';
      statusEl.style.color = '#d93025';
      break;
    case SaveState.CONFLICT:
      statusEl.textContent = 'conflict';
      statusEl.style.color = '#d93025';
      break;
  }
}

// Update debug info
const debugHistory: any[] = [];
function updateDebug(info: any) {
  debugHistory.push({
    time: new Date().toLocaleTimeString(),
    ...info,
  });
  
  // Keep last 15 entries
  if (debugHistory.length > 15) {
    debugHistory.shift();
  }
  
  debugEl.textContent = JSON.stringify(debugHistory, null, 2);
}

// Get current product data
function getCurrentProductData(productId: string) {
  const currentState = productStates.get(productId);
  const nameInput = document.querySelector<HTMLInputElement>(`.name-input[data-product-id="${productId}"]`);
  const priceInput = document.querySelector<HTMLInputElement>(`.price-input[data-product-id="${productId}"]`);
  const descInput = document.querySelector<HTMLTextAreaElement>(`.description-input[data-product-id="${productId}"]`);
  
  return {
    ...currentState,
    name: nameInput?.value || '',
    price: parseInt(priceInput?.value || '0'),
    description: descInput?.value || '',
  };
}

// Setup state change callback for specific product
function setupProductCallbacks(product: typeof mockProducts[0]) {
  // Use the product-specific state change tracking
  const originalOnStateChange = manager['registry'].get(ENTITY.PRODUCT)?.config.onStateChange;
  
  // We'll track state changes by listening to the global state but filtering by ID
  const checkInterval = setInterval(() => {
    const state = manager.getSaveState(ENTITY.PRODUCT, product.id);
    const currentStatusEl = document.getElementById(`status-${product.id}`);
    if (currentStatusEl) {
      const currentText = currentStatusEl.textContent;
      let expectedText = 'ready';
      
      switch (state) {
        case SaveState.SAVING:
          expectedText = 'saving...';
          break;
        case SaveState.SAVED:
          expectedText = 'saved';
          break;
        case SaveState.ERROR:
          expectedText = 'error';
          break;
        case SaveState.CONFLICT:
          expectedText = 'conflict';
          break;
      }
      
      if (currentText !== expectedText && currentText !== 'ready') {
        // Don't override if it's already showing the right status
      }
    }
  }, 100);
}

// Setup product row
function setupProductRow(product: typeof mockProducts[0], row: HTMLTableRowElement) {
  // Setup input event listeners
  const nameInput = row.querySelector('.name-input') as HTMLInputElement;
  const priceInput = row.querySelector('.price-input') as HTMLInputElement;
  const descInput = row.querySelector('.description-input') as HTMLTextAreaElement;
  const forceSaveBtn = row.querySelector('.force-save-btn') as HTMLButtonElement;
  const checkBtn = row.querySelector('.check-btn') as HTMLButtonElement;
  const deleteBtn = row.querySelector('.delete-btn') as HTMLButtonElement;
  
  // Auto-save on name change
  nameInput.addEventListener('input', () => {
    const data = getCurrentProductData(product.id);
    updateDebug({ event: 'input changed', product: product.name, field: 'name', value: data.name });
    updateProductStatus(product.id, SaveState.IDLE, product.name);
    
    manager.save(ENTITY.PRODUCT, data).then(() => {
      updateProductStatus(product.id, SaveState.SAVED, data.name);
      updateDebug({ event: 'saved', product: data.name });
      product.name = data.name; // Update product reference
    }).catch(err => {
      updateProductStatus(product.id, SaveState.ERROR, product.name);
      updateDebug({ event: 'save failed', product: product.name, error: err.message });
    });
    
    setTimeout(() => {
      if (manager.getSaveState(ENTITY.PRODUCT, product.id!) === SaveState.IDLE) {
        const currentState = productStates.get(product.id);
        if (currentState?.name !== data.name) {
          updateProductStatus(product.id, SaveState.SAVING, product.name);
        }
      }
    }, 50);
  });
  
  // Auto-save on price change
  priceInput.addEventListener('input', () => {
    const data = getCurrentProductData(product.id);
    updateDebug({ event: 'input changed', product: product.name, field: 'price', value: data.price });
    updateProductStatus(product.id, SaveState.IDLE, product.name);
    
    manager.save(ENTITY.PRODUCT, data).then(() => {
      updateProductStatus(product.id, SaveState.SAVED, product.name);
      updateDebug({ event: 'saved', product: product.name });
    }).catch(err => {
      updateProductStatus(product.id, SaveState.ERROR, product.name);
      updateDebug({ event: 'save failed', product: product.name, error: err.message });
    });
    
    // Show saving state after a short delay (to show the debounce is working)
    setTimeout(() => {
      if (manager.getSaveState(ENTITY.PRODUCT, product.id!) === SaveState.IDLE) {
        const currentState = productStates.get(product.id);
        if (currentState?.price !== data.price) {
          updateProductStatus(product.id, SaveState.SAVING, product.name);
        }
      }
    }, 50);
  });
  
  descInput.addEventListener('input', () => {
    const data = getCurrentProductData(product.id);
    updateDebug({ event: 'input changed', product: product.name, field: 'description' });
    updateProductStatus(product.id, SaveState.IDLE, product.name);
    
    manager.save(ENTITY.PRODUCT, data).then(() => {
      updateProductStatus(product.id, SaveState.SAVED, product.name);
      updateDebug({ event: 'saved', product: product.name });
    }).catch(err => {
      updateProductStatus(product.id, SaveState.ERROR, product.name);
      updateDebug({ event: 'save failed', product: product.name, error: err.message });
    });
    
    setTimeout(() => {
      if (manager.getSaveState(ENTITY.PRODUCT, product.id!) === SaveState.IDLE) {
        const currentState = productStates.get(product.id);
        if (currentState?.description !== data.description) {
          updateProductStatus(product.id, SaveState.SAVING, product.name);
        }
      }
    }, 50);
  });
  
  // Force save button
  forceSaveBtn.addEventListener('click', async () => {
    const data = getCurrentProductData(product.id);
    updateDebug({ event: 'force save clicked', product: product.name });
    updateProductStatus(product.id, SaveState.SAVING, product.name);
    
    try {
      await manager.save(ENTITY.PRODUCT, data, { immediate: true });
      updateProductStatus(product.id, SaveState.SAVED, product.name);
      updateDebug({ event: 'force save completed', product: product.name });
    } catch (error) {
      updateProductStatus(product.id, SaveState.ERROR, product.name);
      updateDebug({ event: 'force save failed', product: product.name, error });
    }
  });
  
  // Check stock button
  checkBtn.addEventListener('click', async () => {
    const data = getCurrentProductData(product.id);
    updateDebug({ event: 'check stock clicked', product: product.name });
    
    try {
      const result = await manager.call(ENTITY.PRODUCT, 'check', data);
      alert(`${product.name}の在庫チェック結果：\n在庫${result.inStock ? 'あり' : 'なし'}${result.inStock ? ` (${result.quantity}個)` : ''}`);
      updateDebug({ event: 'check stock completed', product: product.name, result });
    } catch (error) {
      updateDebug({ event: 'check stock failed', product: product.name, error });
    }
  });
  
  // Delete button
  deleteBtn.addEventListener('click', async () => {
    if (!confirm(`${product.name}を本当に削除しますか？`)) {
      return;
    }
    
    updateDebug({ event: 'delete clicked', product: product.name });
    
    try {
      await manager.delete(ENTITY.PRODUCT, product.id, { immediate: true });
      row.style.opacity = '0.5';
      row.style.pointerEvents = 'none';
      alert(`${product.name}を削除しました`);
      updateDebug({ event: 'delete completed', product: product.name });
    } catch (error) {
      updateDebug({ event: 'delete failed', product: product.name, error });
    }
  });
}

// Render all products
mockProducts.forEach(product => {
  const row = createProductRow(product);
  productsContainer.appendChild(row);
  setupProductRow(product, row);
});

// Add product button
addProductBtn.addEventListener('click', () => {
  const newProduct = {
    id: `product-${productCounter}`,
    name: `新商品${productCounter - 3}`,
    price: 0,
    description: '',
    version: 1,
  };
  
  productCounter++;
  productStates.set(newProduct.id, newProduct);
  
  const row = createProductRow(newProduct);
  productsContainer.appendChild(row);
  setupProductRow(newProduct, row);
  
  updateDebug({ event: 'product added', product: newProduct.name, id: newProduct.id });
});

// Initial debug info
updateDebug({ event: 'initialized', products: mockProducts.map(p => p.name) });

console.log('🚀 Reactive Manager Demo initialized');
console.log('💡 各商品を個別に編集してみてください - 1秒後に個別に自動保存されます');
console.log('🔍 トマトを編集してもにんじんには影響しません');
