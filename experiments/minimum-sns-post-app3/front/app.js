// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State
let currentEditId = null;

// DOM Elements (will be initialized in DOMContentLoaded)
let contentTextarea;
let submitBtn;
let cancelBtn;
let postForm;
let errorMessage;
let successMessage;
let charCount;
let loading;
let errorContainer;
let listErrorMessage;
let retryBtn;
let emptyState;
let postsContainer;
let postCount;

// API Service
const api = {
    async getAllPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // nullやundefinedの場合はエラーとして扱う（APIの実装ミス）
            if (data === null || data === undefined) {
                throw new Error('APIレスポンスがnullです');
            }
            
            // 配列でない場合はエラー
            if (!Array.isArray(data)) {
                throw new Error('APIレスポンスが配列ではありません');
            }
            
            // 正常な空配列を返す（投稿が0件の場合）
            return data;
        } catch (error) {
            console.error('API getAllPosts error:', error);
            throw error;
        }
    },

    async getPostById(id) {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('投稿が見つかりません');
            }
            throw new Error('投稿の取得に失敗しました');
        }
        return await response.json();
    },

    async createPost(content) {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '投稿の作成に失敗しました');
        }

        return await response.json();
    },

    async updatePost(id, content) {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '投稿の更新に失敗しました');
        }

        return await response.json();
    },

    async deletePost(id) {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('投稿が見つかりません');
            }
            throw new Error('投稿の削除に失敗しました');
        }
    },
};

// UI Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 2000);
}

function updateCharCount() {
    if (!contentTextarea || !charCount) {
        return;
    }
    const count = contentTextarea.value ? contentTextarea.value.length : 0;
    charCount.textContent = count;
}

function setEditMode(post) {
    if (!post || !post.id) return;
    currentEditId = post.id;
    if (contentTextarea) {
        contentTextarea.value = post.content || '';
    }
    if (submitBtn) {
        submitBtn.textContent = 'Save';
    }
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-block';
    }
    updateCharCount();
}

function clearEditMode() {
    currentEditId = null;
    if (contentTextarea) {
        contentTextarea.value = '';
    }
    if (submitBtn) {
        submitBtn.textContent = 'Submit';
    }
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
    updateCharCount();
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch (error) {
        return dateString;
    }
}

function renderPosts(posts) {
    // DOM要素の存在確認
    if (!emptyState || !postsContainer || !postCount) {
        console.error('renderPosts: DOM elements not found');
        return;
    }

    // null/undefinedまたは配列でない場合はエラー（API側の問題）
    if (!posts || !Array.isArray(posts)) {
        console.error('renderPosts: Invalid posts data', posts);
        if (listErrorMessage && errorContainer) {
            listErrorMessage.textContent = 'データの取得に失敗しました';
            errorContainer.style.display = 'block';
        }
        return;
    }

    // 投稿が0件の場合（正常な状態）
    if (posts.length === 0) {
        emptyState.style.display = 'block';
        postsContainer.innerHTML = '';
        postCount.textContent = '';
        errorContainer.style.display = 'none';
        return;
    }

    // 投稿がある場合
    emptyState.style.display = 'none';
    errorContainer.style.display = 'none';
    postCount.textContent = `${posts.length}件の投稿`;

    emptyState.style.display = 'none';
    postCount.textContent = `${posts.length}件の投稿`;

    postsContainer.innerHTML = posts.map(post => `
        <div class="post-item" data-id="${post.id}">
            <div class="post-content">${escapeHtml(post.content)}</div>
            <div class="post-meta">
                <div class="post-date">${formatDate(post.createdAt)}</div>
                <div class="post-actions">
                    <button class="btn btn-small btn-edit" data-id="${post.id}">Edit</button>
                    <button class="btn btn-small btn-delete" data-id="${post.id}">Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach event listeners
    posts.forEach(post => {
        const editBtn = document.querySelector(`.btn-edit[data-id="${post.id}"]`);
        const deleteBtn = document.querySelector(`.btn-delete[data-id="${post.id}"]`);

        editBtn.addEventListener('click', () => handleEdit(post));
        deleteBtn.addEventListener('click', () => handleDelete(post.id));
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadPosts() {
    if (!loading || !errorContainer || !emptyState || !postsContainer || !postCount) {
        console.error('DOM elements not found');
        return;
    }
    
    loading.style.display = 'block';
    errorContainer.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        const posts = await api.getAllPosts();
        console.log('Loaded posts:', posts);
        renderPosts(posts);
    } catch (error) {
        console.error('loadPosts error:', error);
        if (listErrorMessage && errorContainer) {
            const errorMsg = error.message || '投稿の取得に失敗しました';
            listErrorMessage.textContent = errorMsg;
            errorContainer.style.display = 'block';
        }
        // エラー時は空状態を非表示にして、エラーメッセージのみ表示
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        if (postsContainer) {
            postsContainer.innerHTML = '';
        }
        if (postCount) {
            postCount.textContent = '';
        }
    } finally {
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!contentTextarea) return;

    const content = contentTextarea.value.trim();

    if (!content) {
        showError('投稿内容を入力してください');
        return;
    }

    if (content.length > 1000) {
        showError('投稿内容は1000文字以内で入力してください');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';
    }

    try {
        if (currentEditId) {
            // Update existing post
            await api.updatePost(currentEditId, content);
            showSuccess('投稿を更新しました！');
        } else {
            // Create new post
            await api.createPost(content);
            showSuccess('投稿が完了しました！');
        }

        clearEditMode();
        await loadPosts();
    } catch (error) {
        showError(error.message || 'エラーが発生しました');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            if (currentEditId) {
                submitBtn.textContent = 'Save';
            } else {
                submitBtn.textContent = 'Submit';
            }
        }
    }
}

function handleEdit(post) {
    setEditMode(post);
    // Scroll to form
    document.querySelector('.post-form').scrollIntoView({ behavior: 'smooth' });
}

async function handleDelete(id) {
    if (!confirm('この投稿を削除しますか？')) {
        return;
    }

    try {
        await api.deletePost(id);
        showSuccess('投稿を削除しました');
        await loadPosts();
    } catch (error) {
        showError(error.message);
    }
}

// Event Listeners (moved to DOMContentLoaded)

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // DOM要素を取得
    contentTextarea = document.getElementById('content');
    submitBtn = document.getElementById('submitBtn');
    cancelBtn = document.getElementById('cancelBtn');
    postForm = document.getElementById('postForm');
    errorMessage = document.getElementById('errorMessage');
    successMessage = document.getElementById('successMessage');
    charCount = document.getElementById('charCount');
    loading = document.getElementById('loading');
    errorContainer = document.getElementById('errorContainer');
    listErrorMessage = document.getElementById('listErrorMessage');
    retryBtn = document.getElementById('retryBtn');
    emptyState = document.getElementById('emptyState');
    postsContainer = document.getElementById('postsContainer');
    postCount = document.getElementById('postCount');

    // イベントリスナーを設定
    if (contentTextarea) {
        contentTextarea.addEventListener('input', updateCharCount);
    }
    if (postForm) {
        postForm.addEventListener('submit', handleSubmit);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            clearEditMode();
            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }
            if (successMessage) {
                successMessage.textContent = '';
                successMessage.style.display = 'none';
            }
        });
    }
    if (retryBtn) {
        retryBtn.addEventListener('click', loadPosts);
    }

    updateCharCount();
    loadPosts();
});


