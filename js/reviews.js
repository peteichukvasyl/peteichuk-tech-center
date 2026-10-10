'use strict';
/*
    Peteichuk Resource Center
    Reviews System
    Front-end version
    IMPORTANT:
    Зараз дані зберігаються в localStorage.
    Пізніше цей шар можна замінити на Supabase,
    не змінюючи HTML/CSS інтерфейсу.
*/
/* CONFIG */
const REVIEW_STORAGE_KEY = 'peteichuk_reviews_v1';
const REVIEW_OWNER_KEY = 'peteichuk_reviews_owner_v1';
const REVIEW_SESSION_KEY = 'peteichuk_session';
const REVIEW_USERS_KEY = 'peteichuk_users';
const REVIEW_LOGS_KEY = 'peteichuk_admin_logs';
const REVIEWS_PER_PAGE = 6;
const CATEGORY_NAMES = {
    IT: 'IT',
    'Дизайн': 'Дизайн',
    'Ремонт': 'Ремонт',
    'Інше': 'Інше'
};
/* DOM */
const reviewModal = document.getElementById('reviewModal');
const reviewModalClose = document.getElementById('reviewModalClose');
const openReviewModal = document.getElementById('openReviewModal');
const openReviewModalEmpty = document.getElementById('openReviewModalEmpty');
const cancelReview = document.getElementById('cancelReview');
const reviewForm = document.getElementById('reviewForm');
const reviewFormStatus = document.getElementById('reviewFormStatus');
const reviewGrid = document.getElementById('reviewGrid');
const reviewEmpty = document.getElementById('reviewEmpty');
const reviewPagination = document.getElementById('reviewPagination');
const reviewSearch = document.getElementById('reviewSearch');
const reviewSort = document.getElementById('reviewSort');
const reviewFilters = document.getElementById('reviewFilters');
const reviewYear = document.getElementById('reviewYear');
const averageRating = document.getElementById('averageRating');
const averageStars = document.getElementById('averageStars');
const reviewCount = document.getElementById('reviewCount');
const ratingHint = document.getElementById('ratingHint');
const overallRating = document.getElementById('overallRating');
const overallValue = document.getElementById('reviewOverallValue');
const reviewContent = document.getElementById('reviewContent');
const reviewCharacterCount = document.getElementById('reviewCharacterCount');
const reviewModalTitle = document.getElementById('reviewModalTitle');
const reviewSubmitButton = reviewForm ? reviewForm.querySelector('button[type="submit"]') : null;
let editingReviewId = null;
/* STATE */
let reviews = [];
let activeFilter = 'all';
let activePage = 1;
let searchTerm = '';
let currentOverallRating = 0;
/* DEMO DATA */
/*
    Тут спеціально немає вигаданих відгуків.
    Якщо хочеш протестувати дизайн,
    можна тимчасово додати об'єкти у масив.
    Після підключення Supabase цей блок
    більше не буде потрібний.
*/
/* STORAGE */
function getOwnerId(){let ownerId=localStorage.getItem(REVIEW_OWNER_KEY);if(!ownerId){ownerId='owner_'+Date.now()+'_'+Math.random().toString(36).slice(2,10);localStorage.setItem(REVIEW_OWNER_KEY,ownerId);}return ownerId;}
function isOwnReview(review){return Boolean(review&&review.ownerId&&review.ownerId===getOwnerId());}
function getReviewSession(){try{return JSON.parse(localStorage.getItem(REVIEW_SESSION_KEY)||'null');}catch(error){return null;}}
function getReviewUser(){const session=getReviewSession();if(!session||!session.userId)return null;try{const users=JSON.parse(localStorage.getItem(REVIEW_USERS_KEY)||'[]');if(!Array.isArray(users))return null;return users.find(function(user){return user.id===session.userId;})||null;}catch(error){return null;}}
function getReviewRole(){const user=getReviewUser();return user&&['owner','admin','moderator'].includes(user.role)&&user.blocked!==true?user.role:null;}
function canModerateReviews(){return ['owner','admin','moderator'].includes(getReviewRole());}
function canDeleteReviews(){return ['owner','admin'].includes(getReviewRole());}
function canEditReviews(){return getReviewRole()==='owner';}
function addReviewAdminLog(action,data){const role=getReviewRole();if(!role)return;let logs=[];try{const parsed=JSON.parse(localStorage.getItem(REVIEW_LOGS_KEY)||'[]');logs=Array.isArray(parsed)?parsed:[];}catch(error){}const session=getReviewSession();const user=getReviewUser();logs.push({id:'review_log_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),action:action,authorId:session&&session.userId||'',authorName:user&&user.name||'Адміністрація',authorEmail:user&&user.email||'',authorRole:role,data:data||{},createdAt:new Date().toISOString()});localStorage.setItem(REVIEW_LOGS_KEY,JSON.stringify(logs.slice(-500)));}
function loadReviews() {
    try {
        const stored = localStorage.getItem(REVIEW_STORAGE_KEY);
        if (!stored) {
            reviews = [];
            return;
        }
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            reviews = [];
            return;
        }
        reviews = parsed;
    } catch (error) {
        console.error(
            'Не вдалося завантажити відгуки:',
            error
        );
        reviews = [];
    }
}
function saveReviews() {
    try {
        localStorage.setItem(
            REVIEW_STORAGE_KEY,
            JSON.stringify(reviews)
        );
    } catch (error) {
        console.error(
            'Не вдалося зберегти відгуки:',
            error
        );
    }
}
/* HELPERS */
function escapeHTML(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }
    return new Intl.DateTimeFormat(
        'uk-UA',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }
    ).format(date);
}
function getInitials(name) {
    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) {
        return '?';
    }
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (
        parts[0].charAt(0) +
        parts[1].charAt(0)
    ).toUpperCase();
}
function clampRating(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return 0;
    }
    return Math.min(
        5,
        Math.max(0, number)
    );
}
function average(values) {
    const validValues = values
        .map(Number)
        .filter(
            value =>
                Number.isFinite(value) &&
                value > 0
        );
    if (!validValues.length) {
        return 0;
    }
    return (
        validValues.reduce(
            (sum, value) => sum + value,
            0
        ) / validValues.length
    );
}
function createStars(value) {
    const rating = Math.round(
        clampRating(value)
    );
    let output = '';
    for (let i = 1; i <= 5; i++) {
        output += i <= rating
            ? '★'
            : '☆';
    }
    return output;
}
function getAverageForField(field) {
    return average(
        reviews.filter(review => canModerateReviews() || !review.hidden).map(
            review => review[field]
        )
    );
}
/* MODAL */
function openModal() {
    if (!reviewModal) {
        return;
    }
    reviewModal.classList.add('active');
    reviewModal.setAttribute(
        'aria-hidden',
        'false'
    );
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const nameInput =
            document.getElementById('reviewName');
        if (nameInput) {
            nameInput.focus();
        }
    }, 100);
}
function closeModal() {
    if (!reviewModal) {
        return;
    }
    reviewModal.classList.remove('active');
    reviewModal.setAttribute(
        'aria-hidden',
        'true'
    );
    document.body.style.overflow = '';
    resetReviewForm();
}
if (openReviewModal) {
    openReviewModal.addEventListener(
        'click',
        openModal
    );
}
if (openReviewModalEmpty) {
    openReviewModalEmpty.addEventListener(
        'click',
        openModal
    );
}
if (reviewModalClose) {
    reviewModalClose.addEventListener(
        'click',
        closeModal
    );
}
if (cancelReview) {
    cancelReview.addEventListener(
        'click',
        closeModal
    );
}
if (reviewModal) {
    reviewModal.addEventListener(
        'click',
        event => {
            if (
                event.target.matches(
                    '[data-review-modal-close]'
                )
            ) {
                closeModal();
            }
        }
    );
}
document.addEventListener(
    'keydown',
    event => {
        if (
            event.key === 'Escape' &&
            reviewModal &&
            reviewModal.classList.contains('active')
        ) {
            closeModal();
        }
    }
);
/* OVERALL RATING */
function setOverallRating(value) {
    currentOverallRating = clampRating(value);
    if (overallValue) {
        overallValue.value =
            currentOverallRating;
    }
    const buttons =
        overallRating.querySelectorAll(
            'button[data-rating]'
        );
    buttons.forEach(button => {
        const buttonRating =
            Number(button.dataset.rating);
        button.classList.toggle(
            'active',
            buttonRating <= currentOverallRating
        );
        button.textContent =
            buttonRating <= currentOverallRating
                ? '★'
                : '☆';
    });
    const hints = {
        0: 'Оберіть оцінку',
        1: 'Дуже погано',
        2: 'Погано',
        3: 'Нормально',
        4: 'Добре',
        5: 'Відмінно'
    };
    if (ratingHint) {
        ratingHint.textContent =
            hints[currentOverallRating] ||
            'Оберіть оцінку';
    }
}
if (overallRating) {
    overallRating.addEventListener(
        'click',
        event => {
            const button =
                event.target.closest(
                    'button[data-rating]'
                );
            if (!button) {
                return;
            }
            setOverallRating(
                Number(button.dataset.rating)
            );
        }
    );
}
/* SMALL RATINGS */
document
    .querySelectorAll('.small-rating')
    .forEach(group => {
        const groupName =
            group.dataset.ratingGroup;
        const hiddenInput =
            document.getElementById(
                `${groupName}Value`
            );
        group.addEventListener(
            'click',
            event => {
                const button =
                    event.target.closest(
                        'button[data-value]'
                    );
                if (!button) {
                    return;
                }
                const value =
                    Number(button.dataset.value);
                if (hiddenInput) {
                    hiddenInput.value = value;
                }
                group
                    .querySelectorAll('button')
                    .forEach(item => {
                        item.classList.toggle(
                            'active',
                            Number(item.dataset.value) === value
                        );
                    });
            }
        );
    });
/* CHARACTER COUNT */
if (reviewContent) {
    reviewContent.addEventListener(
        'input',
        () => {
            if (reviewCharacterCount) {
                reviewCharacterCount.textContent =
                    reviewContent.value.length;
            }
        }
    );
}
/* FORM RESET */
function resetReviewForm() {
    editingReviewId=null;
    if (reviewModalTitle) reviewModalTitle.textContent='Залишити відгук';
    if (reviewSubmitButton) reviewSubmitButton.innerHTML='<i class="fa fa-paper-plane"></i> Опублікувати';
    if (!reviewForm) {
        return;
    }
    reviewForm.reset();
    currentOverallRating = 0;
    if (overallValue) {
        overallValue.value = '0';
    }
    setOverallRating(0);
    document
        .querySelectorAll('.small-rating')
        .forEach(group => {
            group
                .querySelectorAll('button')
                .forEach(button => {
                    button.classList.remove(
                        'active'
                    );
                });
        });
    [
        'qualityValue',
        'communicationValue',
        'timelinessValue',
        'resultValue',
        'valueValue'
    ].forEach(id => {
        const element =
            document.getElementById(id);
        if (element) {
            element.value = '0';
        }
    });
    if (reviewCharacterCount) {
        reviewCharacterCount.textContent = '0';
    }
    if (reviewFormStatus) {
        reviewFormStatus.textContent = '';
        reviewFormStatus.className =
            'review-form-status';
    }
}
/* FORM SUBMIT */
if (reviewForm) {
    reviewForm.addEventListener(
        'submit',
        event => {
            event.preventDefault();
            const name =
                document.getElementById(
                    'reviewName'
                ).value.trim();
            const service =
                document.getElementById(
                    'reviewService'
                ).value;
            const title =
                document.getElementById(
                    'reviewTitle'
                ).value.trim();
            const content =
                document.getElementById(
                    'reviewContent'
                ).value.trim();
const quality =
                Number(
                    document.getElementById(
                        'qualityValue'
                    ).value
                );
            const communication =
                Number(
                    document.getElementById(
                        'communicationValue'
                    ).value
                );
            const timeliness =
                Number(
                    document.getElementById(
                        'timelinessValue'
                    ).value
                );
            const result =
                Number(
                    document.getElementById(
                        'resultValue'
                    ).value
                );
            const value =
                Number(
                    document.getElementById(
                        'valueValue'
                    ).value
                );
            if (!name) {
                showFormError(
                    'Будь ласка, введіть ваше ім’я.'
                );
                return;
            }
            if (!service) {
                showFormError(
                    'Оберіть послугу.'
                );
                return;
            }
            if (currentOverallRating < 1) {
                showFormError(
                    'Будь ласка, поставте загальну оцінку.'
                );
                return;
            }
            if (
                !quality ||
                !communication ||
                !timeliness ||
                !result ||
                !value
            ) {
                showFormError(
                    'Будь ласка, оцініть усі додаткові показники.'
                );
                return;
            }
            if (content.length < 20) {
                showFormError(
                    'Відгук має містити щонайменше 20 символів.'
                );
                return;
            }
            if (editingReviewId) {
                const existingReview=reviews.find(item=>item.id===editingReviewId);
                if (!existingReview||!isOwnReview(existingReview)){showFormError('Ви можете змінювати лише власний відгук.');return;}
                existingReview.name=name;
                existingReview.service=service;
                existingReview.title=title||'Відгук клієнта';
                existingReview.content=content;
                existingReview.overall=currentOverallRating;
                existingReview.quality=quality;
                existingReview.communication=communication;
                existingReview.timeliness=timeliness;
                existingReview.result=result;
                existingReview.value=value;
                existingReview.updatedAt=new Date().toISOString();
                saveReviews();
                activePage=1;
                renderAll();
                closeModal();
                showTemporaryMessage('Зміни у відгуку збережено.');
                return;
            }
            const newReview = {
                id:'review_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
                name,
                service,
                title:title||'Відгук клієнта',
                content,
                overall:currentOverallRating,
                quality,
                communication,
                timeliness,
                result,
                value,
                verified:false,
                ownerId:getOwnerId(),
                helpful:0,
                createdAt:new Date().toISOString(),
                updatedAt:null,
                reply:null,
                adminReaction:null
            };
            reviews.unshift(
                newReview
            );
            saveReviews();
            activePage = 1;
            renderAll();
            closeModal();
            showTemporaryMessage(
                'Дякуємо! Ваш відгук додано.'
            );
        }
    );
}
/* FORM STATUS */
function showFormError(message) {
    if (!reviewFormStatus) {
        return;
    }
    reviewFormStatus.textContent =
        message;
    reviewFormStatus.className =
        'review-form-status error';
}
function showTemporaryMessage(message) {
    const notification =
        document.createElement('div');
    notification.className =
        'review-temporary-message';
    notification.textContent =
        message;
    notification.style.position = 'fixed';
    notification.style.left = '50%';
    notification.style.bottom = '25px';
    notification.style.transform =
        'translateX(-50%)';
    notification.style.zIndex = '9000';
    notification.style.padding =
        '13px 20px';
    notification.style.border =
        '1px solid #002c7e';
    notification.style.background =
        '#002c7e';
    notification.style.color =
        '#fff';
    notification.style.fontSize =
        '12px';
    notification.style.boxShadow =
        '0 8px 25px rgba(0,0,0,.15)';
    document.body.appendChild(
        notification
    );
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
/* FILTERS */
if (reviewFilters) {
    reviewFilters.addEventListener(
        'click',
        event => {
            const button =
                event.target.closest(
                    '.review-filter'
                );
            if (!button) {
                return;
            }
            activeFilter =
                button.dataset.filter;
            activePage = 1;
            reviewFilters
                .querySelectorAll(
                    '.review-filter'
                )
                .forEach(item => {
                    item.classList.toggle(
                        'active',
                        item === button
                    );
                });
            renderAll();
        }
    );
}
/* SEARCH */
if (reviewSearch) {
    reviewSearch.addEventListener(
        'input',
        event => {
            searchTerm =
                event.target.value
                    .trim()
                    .toLowerCase();
            activePage = 1;
            renderAll();
        }
    );
}
/* SORT */
if (reviewSort) {
    reviewSort.addEventListener(
        'change',
        () => {
            activePage = 1;
            renderAll();
        }
    );
}
/* FILTER DATA */
function getFilteredReviews() {
    let result = reviews.filter(review => canModerateReviews() || !review.hidden).slice();
    if (activeFilter !== 'all') {
        result =
            result.filter(
                review =>
                    review.service ===
                    activeFilter
            );
    }
    if (searchTerm) {
        result =
            result.filter(
                review => {
                    const searchableText =
                        [
                            review.name,
                            review.service,
                            review.title,
                            review.content
                        ]
                            .join(' ')
                            .toLowerCase();
                    return searchableText
                        .includes(searchTerm);
                }
            );
    }
    const sortValue =
        reviewSort
            ? reviewSort.value
            : 'newest';
    result.sort(
        (a, b) => {
            switch (sortValue) {
                case 'oldest':
                    return (
                        new Date(a.createdAt) -
                        new Date(b.createdAt)
                    );
                case 'rating-high':
                    return (
                        b.overall -
                        a.overall
                    );
                case 'rating-low':
                    return (
                        a.overall -
                        b.overall
                    );
                case 'helpful':
                    return (
                        (b.helpful || 0) -
                        (a.helpful || 0)
                    );
                case 'newest':
                default:
                    return (
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                    );
            }
        }
    );
    return result;
}
/* RENDER REVIEWS */
function renderReviews() {
    if (!reviewGrid) {
        return;
    }
    const filteredReviews =
        getFilteredReviews();
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredReviews.length /
                REVIEWS_PER_PAGE
            )
        );
    if (activePage > totalPages) {
        activePage = totalPages;
    }
    const start =
        (activePage - 1) *
        REVIEWS_PER_PAGE;
    const visibleReviews =
        filteredReviews.slice(
            start,
            start + REVIEWS_PER_PAGE
        );
    reviewGrid.innerHTML = '';
    if (!visibleReviews.length) {
        reviewEmpty.classList.add(
            'active'
        );
        reviewGrid.style.display =
            'none';
        renderPagination(0);
        return;
    }
    reviewEmpty.classList.remove(
        'active'
    );
    reviewGrid.style.display =
        'grid';
    visibleReviews.forEach(
        review => {
            reviewGrid.appendChild(
                createReviewCard(review)
            );
        }
    );
    renderPagination(totalPages);
}
/* REVIEW CARD */
function createReviewCard(review) {
    const article =
        document.createElement('article');
    article.className =
        'review-card' + (review.hidden ? ' review-hidden' : '');
    const safeName =
        escapeHTML(review.name);
    const safeService =
        escapeHTML(
            CATEGORY_NAMES[
                review.service
            ] ||
            review.service
        );
    const safeTitle =
        escapeHTML(
            review.title ||
            'Відгук клієнта'
        );
    const safeContent =
        escapeHTML(
            review.content
        );
    const initials =
        escapeHTML(
            getInitials(review.name)
        );
    const replyHTML =
        review.reply
            ? `
                <div class="review-reply">
                    <div class="review-reply-label">
                        Відповідь Peteichuk Resource Center
                    </div>
                    <p>
                        ${escapeHTML(review.reply.content)}
                    </p>
                </div>
            `
            : '';
    const adminReactionHTML=review.adminReaction?`<div class="review-reply"><div class="review-reply-label">Подяка від адміністрації</div><p>${escapeHTML(review.adminReaction.content)}</p></div>`:'';
    article.innerHTML = `
        <div class="review-card-top">
            <div class="review-card-author">
                <div class="review-avatar">
                    ${initials}
                </div>
                <div class="review-author-info">
                    <strong>
                        ${safeName}
                    </strong>
                    <small>
                        ${formatDate(review.createdAt)}
                    </small>
                    ${
                        review.verified
                            ? `
                                <span class="review-verified">
                                    <i class="fa fa-check-circle"></i>
                                    Підтверджений клієнт
                                </span>
                              `
                            : ''
                    }
                </div>
            </div>
            <div
                class="review-rating"
                aria-label="Оцінка ${review.overall} з 5"
            >
                ${createStars(review.overall)}
            </div>
        </div>
        <div class="review-service">
            ${safeService}
        </div>
        <h3>
            ${safeTitle}
        </h3>
        <div class="review-card-content">
            <p>
                ${safeContent}
            </p>
        </div>
        <div class="review-meta">
            <span>
                <i class="fa fa-star"></i>
                ${Number(review.overall).toFixed(1)}
            </span>
            <span>
                <i class="fa fa-calendar"></i>
                ${formatDate(review.createdAt)}
            </span>
        </div>
        ${replyHTML}
        ${adminReactionHTML}
        <div class="review-helpful">
            <span>Корисно?</span>
            <button type="button" data-helpful="yes" data-review-id="${escapeHTML(review.id)}">
                <i class="fa fa-thumbs-up"></i>
                <span>${Number(review.helpful || 0)}</span>
            </button>
        </div>
        ${isOwnReview(review)?`
            <div class="review-owner-actions">
                <button type="button" data-edit-review="${escapeHTML(review.id)}"><i class="fa fa-pencil"></i> Редагувати</button>
                <button type="button" class="review-delete-btn" data-delete-review="${escapeHTML(review.id)}"><i class="fa fa-trash"></i> Видалити</button>
                ${review.updatedAt?`<span class="review-updated">Змінено ${formatDate(review.updatedAt)}</span>`:''}
            </div>
        `:''}
        ${canModerateReviews()?`
            <div class="review-admin-actions">
                ${review.hidden?`<button type="button" data-review-restore="${escapeHTML(review.id)}"><i class="fa fa-eye"></i> Показати</button>`:`<button type="button" data-review-hide="${escapeHTML(review.id)}"><i class="fa fa-eye-slash"></i> Приховати</button>`}
                ${canDeleteReviews()?`<button type="button" class="review-admin-delete" data-review-admin-delete="${escapeHTML(review.id)}"><i class="fa fa-trash"></i> Видалити</button>`:''}
                <button type="button" data-review-thanks="${escapeHTML(review.id)}"><i class="fa fa-heart"></i> Дякувати</button>
                <div class="review-admin-reply">
                    <textarea data-review-reply-input="${escapeHTML(review.id)}" maxlength="2000" placeholder="Відповідь від адміністрації або модерації">${escapeHTML(review.reply&&review.reply.content||'')}</textarea>
                    <button type="button" data-review-reply="${escapeHTML(review.id)}"><i class="fa fa-reply"></i> Відповісти</button>
                </div>
                ${review.hidden?'<span class="review-moderation-badge">Відгук прихований від публіки</span>':''}
            </div>
        `:''}
    `;
    const helpfulButton =
        article.querySelector(
            '[data-helpful]'
        );
    if (helpfulButton) {
        helpfulButton.addEventListener('click',()=>{markReviewHelpful(review.id);});
    }
    const editButton=article.querySelector('[data-edit-review]');
    if(editButton) editButton.addEventListener('click',()=>openEditReview(review.id));
    const deleteButton=article.querySelector('[data-delete-review]');
    if(deleteButton) deleteButton.addEventListener('click',()=>deleteReview(review.id));
    const hideButton=article.querySelector('[data-review-hide]');
    if(hideButton) hideButton.addEventListener('click',()=>setReviewHidden(review.id,true));
    const restoreButton=article.querySelector('[data-review-restore]');
    if(restoreButton) restoreButton.addEventListener('click',()=>setReviewHidden(review.id,false));
    const adminDeleteButton=article.querySelector('[data-review-admin-delete]');
    if(adminDeleteButton) adminDeleteButton.addEventListener('click',()=>adminDeleteReview(review.id));
    const thanksButton=article.querySelector('[data-review-thanks]');
    if(thanksButton) thanksButton.addEventListener('click',()=>setAdminReaction(review.id,'Дякуємо за ваш відгук!'));
    const replyButton=article.querySelector('[data-review-reply]');
    if(replyButton) replyButton.addEventListener('click',()=>saveAdminReply(review.id,article));
    return article;
}
function openEditReview(reviewId){
    const review=reviews.find(item=>item.id===reviewId);
    if(!review||!isOwnReview(review)){showTemporaryMessage('Ви можете редагувати лише власний відгук.');return;}
    editingReviewId=reviewId;
    document.getElementById('reviewName').value=review.name||'';
    document.getElementById('reviewService').value=review.service||'';
    document.getElementById('reviewTitle').value=review.title||'';
    document.getElementById('reviewContent').value=review.content||'';
    setOverallRating(Number(review.overall)||0);
    ['quality','communication','timeliness','result','value'].forEach(name=>{
        const value=Number(review[name])||0;
        const input=document.getElementById(name+'Value');
        if(input) input.value=String(value);
        const group=document.querySelector(`[data-rating-group="${name}"]`);
        if(group) group.querySelectorAll('button').forEach(button=>button.classList.toggle('active',Number(button.dataset.value)===value));
    });
    if(reviewCharacterCount) reviewCharacterCount.textContent=(review.content||'').length;
    if(reviewModalTitle) reviewModalTitle.textContent='Редагувати відгук';
    if(reviewSubmitButton) reviewSubmitButton.innerHTML='<i class="fa fa-save"></i> Зберегти зміни';
    if(reviewFormStatus){reviewFormStatus.textContent='';reviewFormStatus.className='review-form-status';}
    openModal();
}
function deleteReview(reviewId){
    const review=reviews.find(item=>item.id===reviewId);
    if(!review||!isOwnReview(review)){showTemporaryMessage('Ви можете видаляти лише власний відгук.');return;}
    const confirmed=window.confirm('Видалити цей відгук? Дію неможливо скасувати.');
    if(!confirmed)return;
    reviews=reviews.filter(item=>item.id!==reviewId);
    localStorage.removeItem(`peteichuk_review_helpful_${reviewId}`);
    saveReviews();
    activePage=1;
    renderAll();
    showTemporaryMessage('Ваш відгук видалено.');
}
function setReviewHidden(reviewId,hidden){if(!canModerateReviews())return;const review=reviews.find(item=>item.id===reviewId);if(!review)return;review.hidden=Boolean(hidden);review.moderatedAt=new Date().toISOString();const user=getReviewUser();review.moderatedBy=user&&user.id||null;saveReviews();addReviewAdminLog(hidden?'review_hide':'review_restore',{reviewId:reviewId});renderAll();showTemporaryMessage(hidden?'Відгук приховано.':'Відгук знову опубліковано.');}
function adminDeleteReview(reviewId){if(!canDeleteReviews())return;const review=reviews.find(item=>item.id===reviewId);if(!review)return;if(!window.confirm('Видалити цей відгук назавжди?'))return;reviews=reviews.filter(item=>item.id!==reviewId);localStorage.removeItem(`peteichuk_review_helpful_${reviewId}`);saveReviews();addReviewAdminLog('review_delete',{reviewId:reviewId,ownerId:review.ownerId||''});activePage=1;renderAll();showTemporaryMessage('Відгук видалено адміністрацією.');}
function setAdminReaction(reviewId,message){if(!canModerateReviews())return;const review=reviews.find(item=>item.id===reviewId);if(!review)return;const user=getReviewUser();review.adminReaction={content:message,authorId:user&&user.id||'',authorName:user&&user.name||'Адміністрація',authorRole:getReviewRole(),createdAt:new Date().toISOString()};saveReviews();addReviewAdminLog('review_thanks',{reviewId:reviewId});renderAll();showTemporaryMessage('Подяку збережено.');}
function saveAdminReply(reviewId,article){if(!canModerateReviews())return;const input=article.querySelector('[data-review-reply-input]');if(!input)return;const message=input.value.trim();if(!message){showTemporaryMessage('Напишіть текст відповіді.');return;}const review=reviews.find(item=>item.id===reviewId);if(!review)return;const user=getReviewUser();review.reply={content:message,authorId:user&&user.id||'',authorName:user&&user.name||'Адміністрація',authorRole:getReviewRole(),createdAt:new Date().toISOString()};saveReviews();addReviewAdminLog('review_reply',{reviewId:reviewId});renderAll();showTemporaryMessage('Відповідь збережено.');}
/* HELPFUL */
function markReviewHelpful(reviewId) {
    const storageKey =
        `peteichuk_review_helpful_${reviewId}`;
    if (
        localStorage.getItem(
            storageKey
        ) === 'true'
    ) {
        return;
    }
    const review =
        reviews.find(
            item =>
                item.id === reviewId
        );
    if (!review) {
        return;
    }
    review.helpful =
        Number(review.helpful || 0) + 1;
    localStorage.setItem(
        storageKey,
        'true'
    );
    saveReviews();
    renderReviews();
}
/* PAGINATION */
function renderPagination(totalPages) {
    if (!reviewPagination) {
        return;
    }
    reviewPagination.innerHTML = '';
    if (totalPages <= 1) {
        return;
    }
    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {
        const button =
            document.createElement(
                'button'
            );
        button.type = 'button';
        button.className =
            'review-page-button' +
            (
                page === activePage
                    ? ' active'
                    : ''
            );
        button.textContent =
            page;
        button.addEventListener(
            'click',
            () => {
                activePage = page;
                renderReviews();
                document
                    .getElementById(
                        'reviewsList'
                    )
                    ?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
            }
        );
        reviewPagination.appendChild(
            button
        );
    }
}
/* STATISTICS */
function renderStatistics() {
    const visibleReviews = reviews.filter(review => canModerateReviews() || !review.hidden);
    const count =
        visibleReviews.length;
    const overall =
        average(
            visibleReviews.map(
                review =>
                    review.overall
            )
        );
    const quality =
        getAverageForField(
            'quality'
        );
    const communication =
        getAverageForField(
            'communication'
        );
    const timeliness =
        getAverageForField(
            'timeliness'
        );
    const result =
        getAverageForField(
            'result'
        );
    const value =
        getAverageForField(
            'value'
        );
    if (averageRating) {
        averageRating.textContent =
            overall
                ? overall.toFixed(1)
                : '0.0';
    }
    if (averageStars) {
        averageStars.textContent =
            createStars(overall);
    }
    if (reviewCount) {
        reviewCount.textContent =
            count;
    }
    setStatistic(
        'quality',
        quality
    );
    setStatistic(
        'communication',
        communication
    );
    setStatistic(
        'timeliness',
        timeliness
    );
    setStatistic(
        'result',
        result
    );
    setStatistic(
        'value',
        value
    );
}
function setStatistic(
    name,
    value
) {
    const ratingElement =
        document.getElementById(
            `${name}Rating`
        );
    const progressElement =
        document.getElementById(
            `${name}Progress`
        );
    if (ratingElement) {
        ratingElement.textContent =
            value
                ? value.toFixed(1)
                : '0.0';
    }
    if (progressElement) {
        progressElement.style.width =
            `${(value / 5) * 100}%`;
    }
}
/* RENDER ALL */
function renderAll() {
    renderStatistics();
    renderReviews();
}
/* FOOTER YEAR */
if (reviewYear) {
    reviewYear.textContent =
        new Date().getFullYear();
}
/* TOP BUTTON */
const reviewTop =
    document.getElementById(
        'reviewTop'
    );
if (reviewTop) {
    reviewTop.addEventListener(
        'click',
        event => {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    );
}
/* INITIALIZE */
loadReviews();
renderAll();
setOverallRating(0);