<template>
  <div class="search-panel-shell">
    <div
      class="info-panel search-panel-root"
      :class="[
        isCollapsed ? 'search-panel-collapsed' : 'search-panel-expanded',
        selectedGym ? 'search-panel-has-selection' : 'search-panel-no-selection',
      ]"
    >
      <button
        type="button"
        class="search-panel-mobile-grab"
        aria-label="슬라이드 패널 열기 또는 닫기"
        @click="toggleMobileSheetByHandle"
        @touchstart.passive="onHandleTouchStart"
        @touchend.passive="onHandleTouchEnd"
      >
        <span class="search-panel-mobile-grab-bar" />
      </button>
      <UiIconButton
        v-if="!selectedGym && mobileSheetState === 'full'"
        class="search-panel-mobile-close"
        variant="overlay"
        size="sm"
        aria-label="슬라이드 닫기"
        @click="hideMobileSheet"
      >
        <X :size="20" />
      </UiIconButton>

      <div class="search-panel-content-shell">
        <div class="search-panel-list-pane">
        <div class="search-panel-search-wrap">
          <div class="sx-components-sections-searchpanel-005">
            <div class="search-input-shell">
              <button class="search-panel-search-icon-btn" aria-label="검색" @click="submitSearch">
                <Search class="search-panel-search-icon" :stroke-width="2.5" />
              </button>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="헬스장, PT, 운동 시설 검색"
                class="search-input-field"
                @keyup.enter="submitSearch"
              />
              <button v-if="searchQuery.length > 0" class="search-panel-clear-btn" @click="clearSearch">
                <X :size="20" />
              </button>
            </div>
          </div>
        </div>

        <div class="search-panel-notice-wrap">
          <div class="search-panel-notice">
            <Speaker class="search-panel-notice-icon" />
            <span class="search-panel-notice-text">오운완 커뮤니티 오픈 기념 포인트 이벤트 진행 중!</span>
          </div>
        </div>

        <div class="search-panel-event-wrap">
          <div class="search-panel-event-card">
            <div class="search-panel-event-icon">
              <Dumbbell :size="32" />
            </div>
            <div class="v-grow-1 ux-components-sections-searchpanel-019">
              <div class="search-panel-event-title-row">
                <span class="search-panel-event-title">머슬 마인드 짐 3개월 50% 할인!</span>
                <span class="search-panel-event-tag">이벤트</span>
              </div>
              <p class="search-panel-event-sub">선착순 10명, PT 2회 무료 제공까지...</p>
            </div>
          </div>
        </div>

        <div class="search-panel-list">
          <div
            v-for="gym in filteredGyms"
            :key="gym.id"
            class="search-panel-list-item"
            @click="onSelectGym(gym.id)"
          >
            <div class="search-panel-list-row">
              <div class="search-panel-list-image-wrap">
                <img :src="gym.image || defaultGymImage" :alt="gym.name" class="ux-components-sections-searchpanel-020" />
              </div>

              <div class="search-panel-list-body">
                <div>
                  <div class="sx-components-sections-searchpanel-006">
                    <h3 class="search-panel-list-title">{{ gym.name }}</h3>
                    <Star
                      :size="18"
                      :class="isFavorite(gym.id) ? 'search-panel-list-favorite-active' : 'search-panel-list-favorite-inactive'"
                      :fill="isFavorite(gym.id) ? 'currentColor' : 'none'"
                    />
                  </div>
                  <div class="search-panel-list-rating">
                    <span class="ux-components-sections-searchpanel-021">★</span>
                    <span class="ux-components-sections-searchpanel-022">{{ formatRating(gym.rating) }}</span>
                    <span class="ux-components-sections-searchpanel-023">(리뷰 {{ formatCount(gym.reviews) }}개)</span>
                  </div>
                  <p class="search-panel-list-desc">"{{ truncateText(gym.about, 40) }}"</p>
                  <div class="search-panel-list-open-row">
                    <span :class="getOpenStatusClass(gym?.openStatus)">{{ getOpenStatusLabel(gym?.openStatus) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="search-panel-list-footer">
            <p class="search-panel-list-footer-text">총 {{ filteredGyms.length }}개 결과</p>
          </div>
        </div>
        </div>

        <div class="search-panel-detail-pane">
          <div v-if="selectedGym" ref="detailScrollRef" class="search-panel-detail" @scroll.passive="handleDetailScroll">
            <div class="sx-components-sections-searchpanel-001 search-panel-hero">
              <img :src="selectedGymHeroImage" :alt="selectedGym.name" class="ux-components-sections-searchpanel-001" />
              <UiIconButton
                class="search-panel-hero-btn search-panel-hero-btn-left"
                variant="overlay"
                size="sm"
                @click="onCloseGym"
              >
                <ArrowLeft :size="20" />
              </UiIconButton>
              <UiIconButton
                v-if="mobileSheetState === 'full'"
                class="search-panel-hero-btn search-panel-hero-btn-right ux-components-sections-searchpanel-002"
                variant="overlay"
                size="sm"
                @click="onCloseGym"
              >
                <X :size="20" />
              </UiIconButton>
              <UiIconButton
                class="search-panel-hero-btn search-panel-hero-btn-right search-panel-hero-btn-desktop-close"
                variant="overlay"
                size="sm"
                @click="onCloseGym"
                aria-label="상세 슬라이드 닫기"
              >
                <X :size="20" />
              </UiIconButton>
              <div class="search-panel-hero-badge-wrap">
                <button class="search-panel-hero-badge" @click="handleTabClick('사진')">
                  <Grid :size="14" />
                  <span>{{ photoItems.length }}</span>
                </button>
              </div>
            </div>

            <div class="search-panel-detail-body">
              <div class="search-panel-detail-head">
                <div class="search-panel-title-row">
                  <h2 class="ux-components-sections-searchpanel-003">{{ selectedGym.name }}</h2>
                  <span class="ux-components-sections-searchpanel-004">{{ selectedGymType }}</span>
                </div>
                <div class="search-panel-rating-row">
                  <span class="ux-components-sections-searchpanel-005">★</span>
                  <span class="ux-components-sections-searchpanel-006">{{ formatRating(selectedGymRating) }}</span>
                  <span class="u-text-gray-400">리뷰 {{ selectedGymReviewCount }}</span>
                </div>
                <div class="search-panel-list-open-row">
                  <span :class="getOpenStatusClass(selectedGymOpenStatus)">{{ getOpenStatusLabel(selectedGymOpenStatus) }}</span>
                  <span
                    v-if="selectedGymOpenCloseHint"
                    class="search-panel-open-time-hint"
                  >
                    {{ selectedGymOpenCloseHint }}
                  </span>
                </div>

                <div class="search-panel-route-btns">
                  <button class="search-panel-route-btn search-panel-route-btn-start">출발</button>
                  <button
                    class="search-panel-route-btn search-panel-route-btn-arrive"
                    @click="onRequestArriveDirection"
                  >
                    도착
                  </button>
                </div>

                <div class="search-panel-divider" />

                <div class="search-panel-action-row">
                  <button class="sx-components-sections-searchpanel-002" @click="onToggleFavoriteGym(selectedGym.id)">
                    <Star
                      :size="24"
                      :class="isFavorite(selectedGym.id) ? 'search-panel-list-favorite-active' : 'u-text-gray-400'"
                      :fill="isFavorite(selectedGym.id) ? 'currentColor' : 'none'"
                    />
                    <span class="ux-components-sections-searchpanel-008">저장</span>
                  </button>
                  <div class="search-panel-action-divider" />
                  <button 
                    class="sx-components-sections-searchpanel-002" 
                    @click="startChatWithGymOwner"
                    :disabled="isCreatingChat"
                  >
                    <MessageSquare :size="24" class="u-text-gray-400" />
                    <span class="ux-components-sections-searchpanel-008">{{ isCreatingChat ? '연결 중' : '상담' }}</span>
                  </button>
                  <div class="search-panel-action-divider" />
                  <button class="sx-components-sections-searchpanel-002" @click="handleShareGym">
                    <Share2 :size="24" class="u-text-gray-400" />
                    <span class="ux-components-sections-searchpanel-009">공유</span>
                  </button>
                </div>

              </div>

              <div class="search-panel-tabs-wrap">
                <div class="search-panel-tabs">
                  <button
                    v-for="tab in tabs"
                    :key="tab"
                    class="search-panel-tab-btn"
                    :class="activeTab === tab ? 'search-panel-tab-active' : 'search-panel-tab-inactive'"
                    @click="handleTabClick(tab)"
                  >
                    {{ tab }}
                    <div v-if="activeTab === tab" class="search-panel-tab-underline" />
                  </button>
                </div>
              </div>

              <div
                class="search-panel-content"
                :class="activeTab === '예약' ? 'search-panel-content-reservation' : ''"
              >
                <div v-if="activeTab === '홈'" class="search-panel-content-home">
                  <section class="search-panel-detail-section search-panel-detail-section-info">
                    <h3 class="search-panel-card-title">
                      <Info :size="18" class="ux-components-sections-searchpanel-010" /> 상세 정보
                    </h3>
                    <p class="ux-components-sections-searchpanel-011 search-panel-detail-copy search-panel-detail-copy-offset">
                      {{ selectedGymAbout }}
                    </p>
                  </section>

                  <section class="search-panel-detail-section search-panel-detail-section-location">
                    <div class="search-panel-contact-row">
                      <MapPin :size="16" class="ux-components-sections-searchpanel-010" />
                      <h3 class="ux-components-sections-searchpanel-016">위치</h3>
                    </div>
                    <div class="search-panel-contact-copy">
                      <p class="search-panel-detail-copy">{{ selectedGymAddress }}</p>
                    </div>
                  </section>

                  <section class="search-panel-detail-section search-panel-detail-section-amenities">
                    <h3 class="search-panel-card-title">
                      <Sparkles :size="18" class="ux-components-sections-searchpanel-010" /> 편의 시설
                    </h3>
                    <div class="search-panel-feature-grid">
                      <div
                        v-for="amenity in displayAmenities"
                        :key="amenity.key"
                        class="search-panel-feature-item"
                      >
                        <component :is="amenity.icon" v-if="amenity.icon" :size="18" class="search-panel-feature-icon" />
                        <span>{{ amenity.label }}</span>
                      </div>
                    </div>
                    <p v-if="displayAmenities.length === 0" class="search-panel-feature-empty">등록된 편의시설이 없습니다.</p>
                  </section>

                  <section class="search-panel-detail-section search-panel-detail-section-contact">
                    <div class="search-panel-contact-row">
                      <Phone :size="16" class="ux-components-sections-searchpanel-010" />
                      <h3 class="ux-components-sections-searchpanel-016">연락처</h3>
                    </div>
                    <div class="search-panel-contact-copy">
                      <p class="sx-components-sections-searchpanel-004 search-panel-detail-copy">{{ selectedGymPhone }}</p>
                      <p class="ux-components-sections-searchpanel-017">{{ selectedGymWebsite }}</p>
                    </div>
                  </section>
                </div>

                <div v-else-if="activeTab === '예약'" class="search-panel-tab-content search-panel-reservation-tab">
                  <section class="search-panel-reservation-section search-panel-reservation-section-calendar">
                    <div class="search-panel-reservation-section-lead">
                      <CalendarDays :size="18" />
                      <strong>{{ reservationSelectedDate ? `${reservationSelectedDateLabel} · 시간을 선택해 주세요` : '예약 가능한 날짜를 선택해 주세요' }}</strong>
                    </div>

                    <div class="search-panel-reservation-card-head search-panel-reservation-calendar-head">
                      <div>
                        <p class="search-panel-reservation-card-label">예약 날짜</p>
                        <h3 class="search-panel-reservation-card-title">{{ reservationMonthLabel }}</h3>
                      </div>
                      <div class="search-panel-reservation-month-actions">
                        <button type="button" class="search-panel-reservation-month-btn" @click="moveReservationMonth(-1)">
                          <ChevronLeft :size="16" />
                        </button>
                        <button type="button" class="search-panel-reservation-month-btn" @click="moveReservationMonth(1)">
                          <ChevronRight :size="16" />
                        </button>
                      </div>
                    </div>

                    <div class="search-panel-reservation-calendar">
                      <div class="search-panel-reservation-weekday-row">
                        <span
                          v-for="weekday in reservationWeekdayLabels"
                          :key="weekday"
                          class="search-panel-reservation-weekday"
                        >
                          {{ weekday }}
                        </span>
                      </div>
                      <div class="search-panel-reservation-date-grid">
                        <template v-for="cell in reservationCalendarCells" :key="cell.key">
                          <div
                            v-if="cell.isPlaceholder"
                            class="search-panel-reservation-date-placeholder"
                            aria-hidden="true"
                          />
                          <button
                            v-else
                            type="button"
                            class="search-panel-reservation-date-btn"
                            :class="[
                              cell.isSelected ? 'search-panel-reservation-date-btn-selected' : '',
                              cell.isDisabled ? 'search-panel-reservation-date-btn-disabled' : '',
                            ]"
                            :disabled="cell.isDisabled"
                            @click="selectReservationDate(cell.ymd)"
                          >
                            <span class="search-panel-reservation-date-number">{{ cell.dayNumber }}</span>
                            <span v-if="cell.isToday" class="search-panel-reservation-date-badge">오늘</span>
                            <span
                              v-else-if="cell.availableCount > 0"
                              class="search-panel-reservation-date-dot"
                            />
                          </button>
                        </template>
                      </div>
                    </div>
                  </section>

                  <section class="search-panel-reservation-section search-panel-reservation-section-slots">
                    <div class="search-panel-reservation-card-head search-panel-reservation-slot-head">
                      <div>
                        <p class="search-panel-reservation-card-label">예약 시간</p>
                        <h3 class="search-panel-reservation-card-title">{{ reservationSelectedDateLabel }}</h3>
                      </div>
                      <span class="search-panel-reservation-card-caption">
                        {{ reservationSelectableSlots.length > 0 ? `예약 가능 ${reservationSelectableSlots.length}개` : '예약 가능한 시간 없음' }}
                      </span>
                    </div>

                    <p v-if="!isAuthenticated" class="search-panel-reservation-login-note">
                      <LogIn :size="14" />
                      <span>시간 조회는 가능하며, 예약 확정은 로그인 후 진행됩니다.</span>
                    </p>

                    <div v-if="tabLoading" class="search-panel-empty">
                      <div class="search-panel-empty-icon">
                        <CalendarDays :size="32" />
                      </div>
                      <p class="ux-components-sections-searchpanel-018">예약 가능한 시간을 불러오는 중입니다...</p>
                    </div>
                    <div v-else-if="tabError" class="search-panel-empty">
                      <div class="search-panel-empty-icon">
                        <Info :size="32" />
                      </div>
                      <p class="ux-components-sections-searchpanel-018">{{ tabError }}</p>
                    </div>
                    <div v-else-if="!reservationSelectedDate" class="search-panel-empty search-panel-reservation-empty">
                      <div class="search-panel-empty-icon">
                        <CalendarDays :size="32" />
                      </div>
                      <p class="ux-components-sections-searchpanel-018">선택한 달에는 예약 가능한 날짜가 없습니다.</p>
                    </div>
                    <div v-else-if="reservationSlotSections.length === 0" class="search-panel-empty search-panel-reservation-empty">
                      <div class="search-panel-empty-icon">
                        <CalendarDays :size="32" />
                      </div>
                      <p class="ux-components-sections-searchpanel-018">선택한 날짜에는 등록된 예약 시간이 없습니다.</p>
                    </div>
                    <div v-else class="search-panel-reservation-slot-sections">
                      <section
                        v-for="section in reservationSlotSections"
                        :key="section.key"
                        class="search-panel-reservation-slot-section"
                      >
                        <h4 class="search-panel-reservation-slot-section-title">{{ section.label }}</h4>
                        <div class="search-panel-reservation-slot-grid">
                          <button
                            v-for="slot in section.slots"
                            :key="slot.id || slot.slotDateTime"
                            type="button"
                            class="search-panel-reservation-slot-btn"
                            :class="[
                              slot.slotDateTime === reservationSelectedSlotDateTime ? 'search-panel-reservation-slot-btn-selected' : '',
                              isReservationSlotUnavailable(slot) ? 'search-panel-reservation-slot-btn-disabled' : '',
                            ]"
                            :disabled="isReservationSlotUnavailable(slot)"
                            @click="selectReservationSlot(slot)"
                          >
                            <strong>{{ formatReservationTime(slot.slotDateTime) }}</strong>
                            <span>{{ getReservationSlotMeta(slot) }}</span>
                          </button>
                        </div>
                      </section>
                    </div>

                  <div
                    v-if="reservationFeedbackMessage"
                    class="search-panel-reservation-feedback"
                    :class="reservationFeedbackTone === 'success' ? 'search-panel-reservation-feedback-success' : 'search-panel-reservation-feedback-error'"
                  >
                    <CheckCircle2 v-if="reservationFeedbackTone === 'success'" :size="18" />
                    <Info v-else :size="18" />
                    <p>{{ reservationFeedbackMessage }}</p>
                  </div>

                  <div class="search-panel-reservation-actions">
                    <button
                      type="button"
                      class="search-panel-reservation-reset-btn"
                      @click="resetReservationSelection"
                    >
                      초기화
                    </button>
                    <button
                      type="button"
                      class="search-panel-reservation-submit-btn"
                      :disabled="reservationActionDisabled"
                      @click="submitReservation"
                    >
                      {{ reservationActionLabel }}
                    </button>
                  </div>
                  </section>
                </div>

                <div v-else-if="activeTab === '리뷰'" class="search-panel-tab-content">
                  <div v-if="isAuthenticated" class="search-panel-review-toolbar search-panel-review-toolbar-top">
                    <button
                      type="button"
                      class="search-panel-review-write-btn"
                      @click="openReviewModal"
                    >
                      리뷰 쓰기
                    </button>
                  </div>
                  <div v-if="tabLoading" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <MessageSquare :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">리뷰 정보를 불러오는 중입니다...</p>
                  </div>
                  <div v-else-if="tabError" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <MessageSquare :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">{{ tabError }}</p>
                  </div>
                  <div v-else-if="reviewItems.length === 0" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <MessageSquare :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">등록된 리뷰가 없습니다.</p>
                  </div>
                  <div v-else class="search-panel-review-feed">
                    <article
                      v-for="review in reviewDisplayItems"
                      :key="review.reviewId || review.id"
                      class="search-panel-review-entry"
                    >
                      <div class="search-panel-review-entry-head">
                        <button
                          type="button"
                          class="search-panel-review-author search-panel-review-author-link"
                          :disabled="!review.userId"
                          @click="openReviewAuthorProfile(review)"
                        >
                          <div class="search-panel-review-avatar search-panel-review-avatar-image-wrap">
                            <img
                              :src="review.profileImageUrl"
                              :alt="`${review.nickname || '익명'} 프로필 이미지`"
                              class="search-panel-review-avatar-image"
                              @error="handleUserAvatarError"
                            />
                          </div>
                          <div class="search-panel-review-author-copy">
                            <strong>{{ review.nickname || '익명' }}</strong>
                          </div>
                        </button>
                        <div class="search-panel-review-head-actions">
                          <div class="search-panel-review-score">
                            <Star :size="15" :stroke-width="2.4" fill="currentColor" />
                            <span>{{ formatRating(review.rating) }}</span>
                          </div>
                          <button
                            v-if="review.canEdit"
                            type="button"
                            class="search-panel-review-edit-btn"
                            :aria-label="`${review.nickname || '내'} 리뷰 수정`"
                            @click="openEditReviewModal(review)"
                          >
                            <Pencil :size="16" />
                          </button>
                          <button
                            v-else-if="review.canReport"
                            type="button"
                            class="search-panel-review-report-btn"
                            :aria-label="`${review.nickname || '사용자'} 리뷰 신고`"
                            :disabled="isSubmittingReport && reportTargetRefId === Number(review.reviewId || review.id || 0)"
                            @click="openReportModal(review)"
                          >
                            <Flag :size="16" />
                          </button>
                        </div>
                      </div>

                      <div
                        v-if="review.imageItems.length > 0"
                        class="search-panel-review-media"
                        :class="[
                          review.imageItems.length === 1 ? 'search-panel-review-media-single' : '',
                          review.imageItems.length >= 3 ? 'search-panel-review-media-many' : '',
                        ]"
                      >
                        <button
                          v-for="(imageItem, imageIndex) in review.imageItems"
                          :key="`${review.reviewId || review.id}-${imageIndex}`"
                          type="button"
                          class="search-panel-review-media-button"
                          :aria-label="`리뷰 사진 ${imageIndex + 1} 크게 보기`"
                          @click="openReviewPhotoViewer(review, imageIndex)"
                        >
                          <img
                            :src="imageItem.thumbnailUrl || imageItem.originalUrl"
                            alt="리뷰 사진"
                            class="search-panel-review-media-image"
                          />
                        </button>
                      </div>

                      <p class="search-panel-review-comment">
                        {{ review.isExpanded ? review.commentText : review.commentPreview }}
                      </p>
                      <button
                        v-if="review.isExpandable"
                        type="button"
                        class="search-panel-review-more-btn"
                        @click="toggleReviewExpanded(review)"
                      >
                        {{ review.isExpanded ? '접기' : '더보기...' }}
                      </button>
                    </article>
                    <div v-if="reviewIsLoadingMore" class="search-panel-review-load-more" aria-live="polite">
                      <span class="search-panel-review-load-spinner" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div v-else-if="activeTab === '사진'" class="search-panel-tab-content">
                  <div v-if="tabLoading" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <Camera :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">사진 정보를 불러오는 중입니다...</p>
                  </div>
                  <div v-else-if="tabError" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <Camera :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">{{ tabError }}</p>
                  </div>
                  <div v-else-if="photoItems.length === 0" class="search-panel-empty">
                    <div class="search-panel-empty-icon">
                      <Camera :size="32" />
                    </div>
                    <p class="ux-components-sections-searchpanel-018">등록된 사진이 없습니다.</p>
                  </div>
                  <div v-else class="search-panel-photo-gallery">
                    <div class="search-panel-photo-grid">
                      <button
                        v-for="photo in photoGalleryItems"
                        :key="`${photo.originalUrl}-${photo.index}`"
                        type="button"
                        class="search-panel-photo-item"
                        :class="`search-panel-photo-item-${photo.layout}`"
                        :aria-label="`${photoViewerTitle} 사진 ${photo.index + 1} 크게 보기`"
                        @click="openPhotoViewer(photo.index)"
                      >
                        <img :src="photo.thumbnailUrl" alt="체육관 사진" class="search-panel-photo-image" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      class="search-panel-toggle-btn ux-components-sections-searchpanel-026"
      :class="[
        isCollapsed ? 'search-panel-toggle-btn-collapsed' : 'search-panel-toggle-btn-open',
        selectedGym && !isCollapsed ? 'search-panel-toggle-btn-on-detail' : '',
      ]"
      @click="onToggle"
      aria-label="검색 패널 접기/펼치기"
    >
      <ChevronRight v-if="isCollapsed" :size="16" class="u-text-666" />
      <ChevronLeft v-else :size="16" class="u-text-666" />
    </button>

    <Teleport to="body">
      <div
        v-if="isReviewModalOpen"
        class="search-panel-review-modal-backdrop"
        @click.self="closeReviewModal"
      >
        <div class="search-panel-review-modal">
          <div class="search-panel-review-modal-head">
            <h3>{{ reviewModalTitle }}</h3>
            <button type="button" class="search-panel-review-modal-close" @click="closeReviewModal">
              <X :size="20" />
            </button>
          </div>
          <p class="search-panel-review-modal-gym">{{ selectedGym?.name }}</p>

          <div class="search-panel-review-modal-rating">
            <span>평점</span>
            <div class="search-panel-review-modal-rating-row">
              <button
                v-for="score in [1, 2, 3, 4, 5]"
                :key="score"
                type="button"
                class="search-panel-review-score-btn"
                :class="reviewForm.rating >= score ? 'search-panel-review-score-btn-active' : ''"
                @click="reviewForm.rating = score"
              >
                ★
              </button>
            </div>
          </div>

          <div class="search-panel-review-modal-upload">
            <div class="search-panel-review-modal-upload-head">
              <span>사진</span>
              <span class="search-panel-review-modal-upload-count">{{ reviewModalImageCount }}/10</span>
            </div>
            <input
              ref="reviewImageInputRef"
              type="file"
              class="search-panel-review-file-input"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              @change="onReviewFilesChange"
            />
            <button
              type="button"
              class="search-panel-review-file-btn"
              :disabled="reviewForm.images.length >= maxReviewImageCount"
              @click="openReviewFilePicker"
            >
              사진 선택
            </button>
            <p class="search-panel-review-modal-upload-help">
              {{ isEditingReview ? '새 사진을 선택하면 기존 사진이 교체됩니다. 최대 10장, JPG/PNG 형식만 업로드할 수 있습니다.' : '최대 10장, JPG/PNG 형식만 업로드할 수 있습니다.' }}
            </p>
            <div v-if="reviewPreviewItems.length > 0" class="search-panel-review-preview-grid">
              <div
                v-for="(image, index) in reviewPreviewItems"
                :key="image.key"
                class="search-panel-review-preview-item"
              >
                <img :src="image.previewUrl" alt="리뷰 업로드 이미지" class="search-panel-review-preview-image" />
                <button
                  v-if="image.removable"
                  type="button"
                  class="search-panel-review-preview-remove"
                  @click="removeReviewFile(index)"
                >
                  <X :size="14" />
                </button>
              </div>
            </div>
          </div>

          <textarea
            v-model="reviewForm.comment"
            class="search-panel-review-modal-textarea"
            maxlength="1000"
            placeholder="시설, 청결, 서비스 경험을 자유롭게 남겨주세요."
          />
          <p class="search-panel-review-modal-count">{{ reviewForm.comment.length }}/1000</p>
          <p v-if="reviewSubmitError" class="search-panel-review-modal-error">{{ reviewSubmitError }}</p>

          <div class="search-panel-review-modal-actions">
            <button
              type="button"
              class="search-panel-review-modal-cancel"
              :disabled="isReviewSubmitting"
              @click="closeReviewModal"
            >
              취소
            </button>
            <button
              type="button"
              class="search-panel-review-modal-submit"
              :disabled="isReviewSubmitting || !reviewForm.comment.trim()"
              @click="submitReview"
            >
              {{ reviewModalSubmitLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <ReportReasonModal
      :open="isReportModalOpen"
      :reason="reportReason"
      :error-message="reportErrorMessage"
      :submitting="isSubmittingReport"
      @update:reason="reportReason = $event"
      @close="closeReportModal"
      @submit="submitReport"
    />

    <Teleport to="body">
      <div
        v-if="isPhotoViewerOpen"
        class="search-panel-photo-viewer-backdrop"
        :class="[
          isPhotoViewerMobile ? 'search-panel-photo-viewer-mobile' : '',
          isPhotoViewerMobile && !isPhotoViewerControlsVisible ? 'search-panel-photo-viewer-controls-hidden' : '',
        ]"
        @click.self="closePhotoViewer"
      >
        <div class="search-panel-photo-viewer-stage">
          <button
            type="button"
            class="search-panel-photo-viewer-close"
            aria-label="큰 사진 닫기"
            @click.stop="closePhotoViewer"
          >
            <X :size="24" />
          </button>

          <button
            v-if="photoViewerItems.length > 1"
            type="button"
            class="search-panel-photo-viewer-nav search-panel-photo-viewer-nav-prev"
            aria-label="이전 사진 보기"
            @click.stop="showPrevPhoto"
          >
            <ChevronLeft :size="32" />
          </button>

          <div class="search-panel-photo-viewer-frame">
            <button
              type="button"
              class="search-panel-photo-viewer-image-toggle"
              aria-label="사진 뷰어 버튼 표시 또는 숨기기"
              @click.stop="togglePhotoViewerControls"
            />
            <img
              v-if="selectedPhotoViewerUrl"
              :src="selectedPhotoViewerUrl"
              :alt="`${photoViewerTitle} 큰 사진`"
              class="search-panel-photo-viewer-image"
            />
          </div>

          <button
            v-if="photoViewerItems.length > 1"
            type="button"
            class="search-panel-photo-viewer-nav search-panel-photo-viewer-nav-next"
            aria-label="다음 사진 보기"
            @click.stop="showNextPhoto"
          >
            <ChevronRight :size="32" />
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <transition name="search-panel-share-toast-fade">
        <div
          v-if="shareToastMessage"
          class="search-panel-share-toast"
          :class="shareToastTone === 'error' ? 'search-panel-share-toast-error' : 'search-panel-share-toast-success'"
          role="status"
          aria-live="polite"
        >
          {{ shareToastMessage }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Flag,
  Speaker,
  Dumbbell,
  User,
  Star,
  Wifi,
  ShowerHead,
  Car,
  Lock,
  Scale,
  Shirt,
  Phone,
  MapPin,
  Sparkles,
  ArrowLeft,
  X,
  Share2,
  Grid,
  Camera,
  MessageSquare,
  Info,
  CalendarDays,
  CheckCircle2,
  LogIn,
} from 'lucide-vue-next';
import UiIconButton from '@/components/ui/UiIconButton.vue';
import ReportReasonModal from '@/components/modals/ReportReasonModal.vue';
import { gymApi, reservationApi, reviewApi, chatApi, reportApi } from '@/services/apis';
import { useSession } from '@/composables/useSession';
import { normalizeRole } from '@/services/token';
import { extractList, extractPayload } from '@/utils/api';
import { savePendingChatRoom } from '@/utils/chatNavigation';
import { resolveUserAvatar, handleUserAvatarError } from '@/utils/userAvatar';
import {
  getPrimaryOriginalImageUrl,
  toImageVariantItems,
  toOriginalImageUrls,
} from '@/utils/imageVariants';

const defaultGymImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';
const tabs = ['홈', '예약', '리뷰', '사진'];
const reservationWeekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];
const reservationPeriodConfigs = [
  { key: 'morning', label: '오전', startHour: 0, endHour: 12 },
  { key: 'afternoon', label: '오후', startHour: 12, endHour: 18 },
  { key: 'evening', label: '저녁', startHour: 18, endHour: 24 },
];

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const formatYearMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatDateToYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (value) => {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const isSameMonth = (left, right) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

const parseLocalDateTime = (value) => {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] || 0),
  );
};

const getTodayStart = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const isDateBeforeToday = (value) => {
  const targetDate = parseDateOnly(value);
  if (!targetDate) return false;
  return targetDate.getTime() < getTodayStart().getTime();
};

const formatReservationMonthLabel = (date) => `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatReservationDateLabel = (value) => {
  const date = parseDateOnly(value);
  if (!date) return '날짜를 선택하세요';
  const dayLabel = reservationWeekdayLabels[date.getDay()];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayLabel})`;
};

const formatReservationTime = (value) => {
  const date = parseLocalDateTime(value);
  if (!date) return '--:--';
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

const getReservationSlotHour = (slot) => parseLocalDateTime(slot?.slotDateTime)?.getHours() ?? -1;

const isReservationSlotUnavailable = (slot) => {
  if (!slot) return true;
  if (Boolean(slot?.isClosed)) return true;
  if (Number(slot?.remainingCount || 0) <= 0) return true;
  const date = parseLocalDateTime(slot?.slotDateTime);
  return date ? date.getTime() < Date.now() : true;
};

const activeTab = ref('홈');
const searchQuery = ref('');
const detailScrollRef = ref(null);
const tabLoading = ref(false);
const tabError = ref('');
const gymDetailMap = ref({});
const reviewMap = ref({});
const reviewDetailMap = ref({});
const reviewPaginationMap = ref({});
const photoMap = ref({});
const photoDetailMap = ref({});
const isReviewModalOpen = ref(false);
const isPhotoViewerOpen = ref(false);
const isPhotoViewerMobile = ref(false);
const isPhotoViewerControlsVisible = ref(true);
const isReportModalOpen = ref(false);
const isSubmittingReport = ref(false);
const photoViewerItems = ref([]);
const photoViewerSource = ref('gallery');
const reviewExpandedMap = ref({});
const isReviewSubmitting = ref(false);
const reportReason = ref('');
const reportErrorMessage = ref('');
const reportTargetRefId = ref(null);
const reviewSubmitError = ref('');
const reviewImageInputRef = ref(null);
const selectedPhotoIndex = ref(-1);
const reviewModalMode = ref('create');
const editingReviewId = ref(null);
const reviewExistingImages = ref([]);
const reservationMonthCursor = ref(startOfMonth(new Date()));
const reservationSelectedDate = ref('');
const reservationCalendarMap = ref({});
const reservationSlotMap = ref({});
const reservationSelectedSlotDateTime = ref('');
const reservationSubmitting = ref(false);
const reservationFeedbackMessage = ref('');
const reservationFeedbackTone = ref('info');
const isCreatingChat = ref(false);
const maxReviewImageCount = 10;
const reviewPageSize = 5;
const reviewLoadMoreThreshold = 160;
const allowedReviewImageMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const allowedReviewImageExtensions = new Set(['jpg', 'jpeg', 'png']);
const reviewPreviewCharacterLimit = 140;
const reviewForm = ref({
  rating: 5,
  comment: '',
  images: [],
});
const { sessionProfile, isAuthenticated, primeSessionFromToken, syncSessionFromServer } = useSession();
const route = useRoute();
const router = useRouter();
const shareToastMessage = ref('');
const shareToastTone = ref('success');
let shareToastTimer = null;

const tabQueryValueMap = {
  홈: 'home',
  예약: 'reservation',
  리뷰: 'review',
  사진: 'photo',
};

const tabQueryLabelMap = {
  home: '홈',
  reservation: '예약',
  review: '리뷰',
  photo: '사진',
  홈: '홈',
  예약: '예약',
  리뷰: '리뷰',
  사진: '사진',
};

const amenityLabelMap = {
  FREE_WIFI: '무료 Wi-Fi',
  SHOWER: '샤워실',
  PARKING: '주차 가능',
  PERSONAL_TRAINING: 'PT 가능',
  PT: 'PT 가능',
  LOCKER: '락커',
  INBODY: '인바디',
  LAUNDRY: '세탁실',
};

const amenityOrderMap = {
  FREE_WIFI: 1,
  SHOWER: 2,
  PARKING: 3,
  PERSONAL_TRAINING: 4,
  PT: 4,
  LOCKER: 5,
  INBODY: 6,
  LAUNDRY: 7,
};

const amenityIconMap = {
  FREE_WIFI: Wifi,
  SHOWER: ShowerHead,
  PARKING: Car,
  PERSONAL_TRAINING: User,
  PT: User,
  LOCKER: Lock,
  INBODY: Scale,
  LAUNDRY: Shirt,
};

const props = defineProps({
  isCollapsed: { type: Boolean, required: true },
  onToggle: { type: Function, required: true },
  mobileSheetState: { type: String, default: 'peek' },
  onSetMobileSheetState: { type: Function, default: null },
  selectedGym: { type: Object, default: null },
  onCloseGym: { type: Function, required: true },
  gyms: { type: Array, required: true },
  onSelectGym: { type: Function, required: true },
  favoriteGymIds: { type: Array, required: true },
  onToggleFavoriteGym: { type: Function, required: true },
  onArriveDirection: { type: Function, default: null },
  onRequireAuth: { type: Function, default: null },
  onSyncGym: { type: Function, default: null },
  searchKeyword: { type: String, default: '' },
  onSearchGyms: { type: Function, default: null },
});

const handleTouchStartY = ref(null);

const normalizeId = (value) => String(value ?? '').trim();
const isFavorite = (id) => props.favoriteGymIds.includes(normalizeId(id));
const createEmptyReviewPagination = () => ({
  page: -1,
  size: reviewPageSize,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
  loadingMore: false,
});
const getReviewPaginationState = (gymId) =>
  reviewPaginationMap.value[gymId] || createEmptyReviewPagination();
const setReviewPaginationState = (gymId, patch = {}) => {
  reviewPaginationMap.value = {
    ...reviewPaginationMap.value,
    [gymId]: {
      ...getReviewPaginationState(gymId),
      ...patch,
    },
  };
  return reviewPaginationMap.value[gymId];
};

const selectedGymId = computed(() => normalizeId(props.selectedGym?.id));
const selectedGymDetail = computed(() => gymDetailMap.value[selectedGymId.value] || null);
const reviewItems = computed(() => reviewMap.value[selectedGymId.value] || []);
const selectedGymReviewMeta = computed(() => getReviewPaginationState(selectedGymId.value));
const reviewIsLoadingMore = computed(() => Boolean(selectedGymReviewMeta.value.loadingMore));
const reviewHasNextPage = computed(() => Boolean(selectedGymReviewMeta.value.hasNext));
const reservationCalendarCacheKey = computed(() => {
  if (!selectedGymId.value) return '';
  return `${selectedGymId.value}:${formatYearMonthKey(reservationMonthCursor.value)}`;
});
const reservationMonthAvailability = computed(() => reservationCalendarMap.value[reservationCalendarCacheKey.value] || {});
const reservationSlotCacheKey = computed(() => {
  if (!selectedGymId.value || !reservationSelectedDate.value) return '';
  return `${selectedGymId.value}:${reservationSelectedDate.value}`;
});
const reservationSlots = computed(() => reservationSlotMap.value[reservationSlotCacheKey.value] || []);
const selectedReservationSlot = computed(() =>
  reservationSlots.value.find((slot) => slot?.slotDateTime === reservationSelectedSlotDateTime.value) || null);
const selectedGymReviewCount = computed(() => {
  const totalElements = Number(selectedGymReviewMeta.value.totalElements || 0);
  if (Number.isFinite(totalElements) && totalElements > 0) return totalElements;
  return formatCount(
    selectedGymDetail.value?.reviewCount
      ?? selectedGymDetail.value?.reviews
      ?? props.selectedGym?.reviewCount
      ?? props.selectedGym?.reviews,
  );
});
const selectedGymOpenStatus = computed(() =>
  String(selectedGymDetail.value?.openStatus ?? props.selectedGym?.openStatus ?? 'UNKNOWN').toUpperCase(),
);

const weekDayCodes = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const normalizeTimeToHHmm = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return raw;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const resolveTodayCloseTime = (detail, summary) => {
  const directCandidates = [
    detail?.todayCloseTime,
    detail?.closeTime,
    detail?.closingTime,
    detail?.endTime,
    summary?.todayCloseTime,
    summary?.closeTime,
    summary?.closingTime,
    summary?.endTime,
  ];
  for (const candidate of directCandidates) {
    const normalized = normalizeTimeToHHmm(candidate);
    if (normalized) return normalized;
  }

  const gymHours = Array.isArray(detail?.gymHours) ? detail.gymHours : [];
  if (gymHours.length === 0) return '';
  const todayCode = weekDayCodes[new Date().getDay()];
  const todayHours = gymHours.find((item) => String(item?.dayOfWeek || '').toUpperCase() === todayCode);
  if (!todayHours) return '';
  const isClosed = Boolean(todayHours?.isClosed ?? todayHours?.closed);
  if (isClosed) return '';
  return normalizeTimeToHHmm(todayHours?.closeTime);
};

const selectedGymOpenCloseHint = computed(() => {
  if (selectedGymOpenStatus.value !== 'OPEN') return '';
  const closeTime = resolveTodayCloseTime(selectedGymDetail.value, props.selectedGym);
  return closeTime ? `~${closeTime}` : '';
});
const sessionRole = computed(() => normalizeRole(sessionProfile.value?.role));
const sessionUserId = computed(() => normalizeId(sessionProfile.value?.id));
const canWriteReview = computed(() => isAuthenticated.value && sessionRole.value === 'USER');
const isEditingReview = computed(() => reviewModalMode.value === 'edit' && editingReviewId.value != null);
const reservationMonthLabel = computed(() => formatReservationMonthLabel(reservationMonthCursor.value));
const reservationSelectedDateLabel = computed(() => formatReservationDateLabel(reservationSelectedDate.value));
const reservationCalendarCells = computed(() => {
  const monthStart = startOfMonth(reservationMonthCursor.value);
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const leadingPlaceholderCount = monthStart.getDay();
  const trailingPlaceholderCount = (7 - ((leadingPlaceholderCount + daysInMonth) % 7)) % 7;
  const cells = [];

  for (let index = 0; index < leadingPlaceholderCount; index += 1) {
    cells.push({
      key: `placeholder-start-${index}`,
      isPlaceholder: true,
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const cellDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNumber);
    const ymd = formatDateToYmd(cellDate);
    const daySummary = reservationMonthAvailability.value[ymd] || null;
    const availableCount = Number(daySummary?.availableSlotCount || 0);
    const isDisabled = isDateBeforeToday(ymd) || availableCount <= 0;

    cells.push({
      key: ymd,
      isPlaceholder: false,
      ymd,
      dayNumber,
      isToday: ymd === formatDateToYmd(new Date()),
      isSelected: ymd === reservationSelectedDate.value,
      isDisabled,
      availableCount,
    });
  }

  for (let index = 0; index < trailingPlaceholderCount; index += 1) {
    cells.push({
      key: `placeholder-end-${index}`,
      isPlaceholder: true,
    });
  }

  return cells;
});
const reservationSelectableSlots = computed(() =>
  reservationSlots.value.filter((slot) => !isReservationSlotUnavailable(slot)));
const reservationSlotSections = computed(() => {
  const sections = reservationPeriodConfigs
    .map((section) => ({
      ...section,
      slots: reservationSelectableSlots.value.filter((slot) => {
        const hour = getReservationSlotHour(slot);
        return hour >= section.startHour && hour < section.endHour;
      }),
    }))
    .filter((section) => section.slots.length > 0);

  if (sections.length > 0) return sections;
  if (reservationSelectableSlots.value.length === 0) return [];
  return [{ key: 'all', label: '전체', slots: reservationSelectableSlots.value }];
});
const reservationActionLabel = computed(() => {
  if (reservationSubmitting.value) return '예약 중...';
  if (!selectedReservationSlot.value) return '시간을 선택하세요';
  if (!isAuthenticated.value) return '로그인하고 예약';
  return '예약하기';
});
const reservationActionDisabled = computed(() =>
  reservationSubmitting.value || !selectedReservationSlot.value);

const selectedGymType = computed(() =>
  selectedGymDetail.value?.categoryName
    || props.selectedGym?.type
    || props.selectedGym?.categoryName
    || '-');

const selectedGymRating = computed(() =>
  Number(
    selectedGymDetail.value?.rating
      ?? props.selectedGym?.rating
      ?? 0,
  ));
const selectedGymAbout = computed(() =>
  selectedGymDetail.value?.description
    || props.selectedGym?.about
    || '');
const selectedGymPhone = computed(() =>
  selectedGymDetail.value?.tel
    || props.selectedGym?.phone
    || '-');
const selectedGymAddress = computed(() =>
  selectedGymDetail.value?.address
    || props.selectedGym?.address
    || props.selectedGym?.location
    || '-');
const selectedGymWebsite = computed(() => props.selectedGym?.website || '');

const selectedGymDefaultPhotoItems = computed(() => {
  const detailImages = toImageVariantItems(selectedGymDetail.value?.images);
  if (detailImages.length > 0) return detailImages;
  const listImages = toImageVariantItems(props.selectedGym?.images);
  if (listImages.length > 0) return listImages;
  return toImageVariantItems(props.selectedGym?.image);
});

const getReviewKey = (review) => String(review?.reviewId ?? review?.id ?? '');

const getReviewPreviewText = (comment) => {
  const value = String(comment || '');
  if (value.length <= reviewPreviewCharacterLimit) return value;
  return `${value.slice(0, reviewPreviewCharacterLimit).trimEnd()}...`;
};

const canEditReviewItem = (review) =>
  canWriteReview.value
  && Boolean(sessionUserId.value)
  && normalizeId(review?.userId ?? review?.user?.id) === sessionUserId.value;

const openReviewAuthorProfile = (review) => {
  const userId = Number(review?.userId ?? review?.user?.id ?? 0);
  if (!Number.isFinite(userId) || userId <= 0) return;
  if (normalizeId(userId) === sessionUserId.value) {
    router.push({ path: '/profile' });
    return;
  }
  router.push({ path: '/profile', query: { userId: String(userId) } });
};

const reviewDisplayItems = computed(() =>
  reviewItems.value.map((review) => ({
    ...review,
    userId: review?.userId ?? review?.user?.id ?? null,
    profileImageUrl: resolveUserAvatar(review?.profileImageUrl
      ?? review?.user?.profileThumbnailUrl
      ?? review?.user?.profileImageUrl
      ?? ''),
    imageItems: toImageVariantItems(review?.images),
    reviewKey: getReviewKey(review),
    commentText: String(review?.comment || ''),
    isExpandable: String(review?.comment || '').length > reviewPreviewCharacterLimit,
    isExpanded: Boolean(reviewExpandedMap.value[getReviewKey(review)]),
    commentPreview: getReviewPreviewText(review?.comment),
    canEdit: canEditReviewItem(review),
    canReport: isAuthenticated.value && !canEditReviewItem(review),
  })));

const reviewModalTitle = computed(() => (isEditingReview.value ? '리뷰 수정' : '리뷰 작성'));
const reviewModalSubmitLabel = computed(() => {
  if (isReviewSubmitting.value) return isEditingReview.value ? '수정 중...' : '등록 중...';
  return isEditingReview.value ? '수정하기' : '등록하기';
});
const reviewModalImageCount = computed(() =>
  reviewForm.value.images.length > 0 ? reviewForm.value.images.length : reviewExistingImages.value.length);
const reviewPreviewItems = computed(() => {
  if (reviewForm.value.images.length > 0) {
    return reviewForm.value.images.map((image, index) => ({
      key: `new-${image.name}-${index}`,
      previewUrl: image.previewUrl,
      removable: true,
    }));
  }
  return reviewExistingImages.value.map((url, index) => ({
    key: `existing-${index}`,
    previewUrl: url,
    removable: false,
  }));
});

const photoItems = computed(() => {
  const eventImages = toImageVariantItems(photoMap.value[selectedGymId.value] || []);
  if (eventImages.length > 0) return eventImages;
  return selectedGymDefaultPhotoItems.value;
});

const resolvePhotoLayout = (index) => {
  const pattern = ['square', 'square', 'square', 'square', 'square', 'tall', 'tall', 'square', 'square', 'tall'];
  return pattern[index % pattern.length];
};

const photoGalleryItems = computed(() =>
  photoItems.value.map((item, index) => ({
    originalUrl: item.originalUrl,
    thumbnailUrl: item.thumbnailUrl || item.originalUrl,
    index,
    layout: resolvePhotoLayout(index),
  })));

const selectedPhotoViewerUrl = computed(() => photoViewerItems.value[selectedPhotoIndex.value] || '');

const photoViewerTitle = computed(() => String(props.selectedGym?.name || '체육관'));

const selectedGymHeroImage = computed(() =>
  getPrimaryOriginalImageUrl(selectedGymDetail.value?.images)
    || getPrimaryOriginalImageUrl(props.selectedGym?.images)
    || props.selectedGym?.image
    || defaultGymImage);

const formatAmenityLabel = (code, name) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (amenityLabelMap[normalizedCode]) return amenityLabelMap[normalizedCode];
  if (name && name !== code) return String(name);
  if (!normalizedCode) return '';
  return normalizedCode.replace(/_/g, ' ');
};

const displayAmenities = computed(() => {
  const source = selectedGymDetail.value?.amenities
    || props.selectedGym?.amenities
    || props.selectedGym?.amenityCodes
    || props.selectedGym?.features
    || [];
  const list = Array.isArray(source) ? source : [];
  const dedup = new Set();

  return list
    .map((item) => {
      if (typeof item === 'string') {
        const normalizedCode = item.toUpperCase();
        return {
          key: normalizedCode,
          code: normalizedCode,
          sortId: null,
          label: formatAmenityLabel(normalizedCode, item),
          icon: amenityIconMap[normalizedCode] || null,
        };
      }

      const code = String(item?.code || item?.amenityCode || item?.name || '').toUpperCase();
      const key = code || String(item?.id || item?.name || Math.random());
      const rawSortId = Number(item?.id ?? item?.amenityId ?? item?.amenity_id);
      const sortId = Number.isFinite(rawSortId) ? rawSortId : null;
      return {
        key,
        code,
        sortId,
        label: formatAmenityLabel(code, item?.name),
        icon: amenityIconMap[code] || null,
      };
    })
    .filter((item) => {
      if (!item?.label || dedup.has(item.key)) return false;
      dedup.add(item.key);
      return true;
    })
    .sort((a, b) => {
      const aHasId = Number.isFinite(a.sortId);
      const bHasId = Number.isFinite(b.sortId);
      if (aHasId && bHasId) return a.sortId - b.sortId;
      if (aHasId) return -1;
      if (bHasId) return 1;

      const aOrder = amenityOrderMap[a.code] ?? Number.MAX_SAFE_INTEGER;
      const bOrder = amenityOrderMap[b.code] ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.label).localeCompare(String(b.label), 'ko');
    });
});

const formatRating = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0.0';
  return numeric.toFixed(1);
};

const formatCount = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric);
};

const getOpenStatusLabel = (status) => {
  const normalized = String(status || 'UNKNOWN').toUpperCase();
  if (normalized === 'OPEN') return '영업 중';
  if (normalized === 'CLOSED') return '영업 종료';
  if (normalized === 'CLOSED_EXCEPTION' || normalized === 'CLOSED_REGULAR') return '금일 휴무';
  return '운영 정보 없음';
};

const getOpenStatusClass = (status) => {
  const normalized = String(status || 'UNKNOWN').toUpperCase();
  if (normalized === 'OPEN') return 'ux-components-sections-searchpanel-024';
  if (normalized === 'CLOSED' || normalized === 'CLOSED_EXCEPTION' || normalized === 'CLOSED_REGULAR') {
    return 'ux-components-sections-searchpanel-027';
  }
  return 'u-text-gray-400';
};

const truncateText = (text, maxLength = 40) => {
  const value = String(text || '').trim();
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

const ensureGymDetail = async (gymId, options = {}) => {
  const { force = false } = options;
  if (!gymId) return null;
  if (!force && gymDetailMap.value[gymId]) {
    return gymDetailMap.value[gymId] || null;
  }

  const response = await gymApi.detail(gymId);
  const payload = extractPayload(response, {});
  gymDetailMap.value = {
    ...gymDetailMap.value,
    [gymId]: payload || {},
  };
  if (typeof props.onSyncGym === 'function' && payload) {
    props.onSyncGym(payload);
  }
  return gymDetailMap.value[gymId];
};

const normalizeReviewPageMeta = (payload, itemCount = 0) => {
  const page = Number(payload?.number ?? payload?.page ?? payload?.pageable?.pageNumber ?? 0);
  const size = Number(payload?.size ?? payload?.pageable?.pageSize ?? reviewPageSize);
  const totalElements = Number(payload?.totalElements ?? payload?.total ?? itemCount);
  const totalPages = Number(
    payload?.totalPages
      ?? (Number.isFinite(totalElements) && size > 0 ? Math.ceil(totalElements / size) : 0),
  );
  const hasNext = Boolean(
    payload?.hasNext
      ?? (payload?.last != null
        ? !payload.last
        : (Number.isFinite(totalPages) ? page + 1 < totalPages : itemCount >= size)),
  );

  return {
    page: Number.isFinite(page) ? page : 0,
    size: Number.isFinite(size) && size > 0 ? size : reviewPageSize,
    totalElements: Number.isFinite(totalElements) ? totalElements : itemCount,
    totalPages: Number.isFinite(totalPages) ? totalPages : 0,
    hasNext,
  };
};

const mergeReviewPages = (currentItems = [], nextItems = []) => {
  const merged = [];
  const seen = new Set();

  [...currentItems, ...nextItems].forEach((item, index) => {
    const key = getReviewKey(item) || `${item?.createdTime || ''}:${item?.nickname || ''}:${index}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return merged;
};

const syncGymReviewStats = (gymId, reviews = [], pageMeta = null) => {
  if (typeof props.onSyncGym !== 'function') return;
  const list = Array.isArray(reviews) ? reviews : [];
  const reviewCount = Number(pageMeta?.totalElements);
  const normalizedReviewCount = Number.isFinite(reviewCount) && reviewCount >= 0 ? reviewCount : list.length;

  props.onSyncGym({
    id: gymId,
    reviewCount: normalizedReviewCount,
    reviews: normalizedReviewCount,
  });
};

const loadGymReviewPage = async (gymId, page = 0, options = {}) => {
  const { append = false } = options;
  const response = await reviewApi.listPage({ gymId, page, size: reviewPageSize });
  const payload = extractPayload(response, {});
  const list = extractList(payload);
  const hasGymIdField = list.some((item) =>
    item?.gymId != null || item?.gym?.id != null);
  const filtered = hasGymIdField
    ? list.filter((item) => {
      const candidateGymId = item?.gymId ?? item?.gym?.id;
      return normalizeId(candidateGymId) === gymId;
    })
    : list;
  const pageMeta = normalizeReviewPageMeta(payload, filtered.length);
  const currentItems = append ? reviewMap.value[gymId] || [] : [];
  const nextItems = append ? mergeReviewPages(currentItems, filtered) : filtered;

  reviewMap.value = {
    ...reviewMap.value,
    [gymId]: nextItems,
  };
  setReviewPaginationState(gymId, {
    ...pageMeta,
    loadingMore: false,
  });
  syncGymReviewStats(gymId, nextItems, pageMeta);
  return nextItems;
};

const ensureGymReviews = async (gymId, options = {}) => {
  const { force = false } = options;
  if (!gymId) return [];
  if (!force && reviewMap.value[gymId]) {
    const cached = reviewMap.value[gymId] || [];
    syncGymReviewStats(gymId, cached, getReviewPaginationState(gymId));
    return cached;
  }

  setReviewPaginationState(gymId, {
    ...createEmptyReviewPagination(),
    loadingMore: false,
  });
  return loadGymReviewPage(gymId, 0);
};

const ensureReviewDetail = async (reviewId, options = {}) => {
  const { force = false } = options;
  const normalizedReviewId = normalizeId(reviewId);
  if (!normalizedReviewId) return null;
  if (!force && reviewDetailMap.value[normalizedReviewId]) {
    return reviewDetailMap.value[normalizedReviewId];
  }

  const response = await reviewApi.detail(normalizedReviewId);
  const payload = extractPayload(response, {});
  reviewDetailMap.value = {
    ...reviewDetailMap.value,
    [normalizedReviewId]: payload,
  };
  return payload;
};

const loadMoreGymReviews = async (gymId) => {
  if (!gymId) return [];
  const currentState = getReviewPaginationState(gymId);
  if (currentState.loadingMore || !currentState.hasNext) {
    return reviewMap.value[gymId] || [];
  }

  setReviewPaginationState(gymId, { loadingMore: true });
  try {
    return await loadGymReviewPage(gymId, currentState.page + 1, { append: true });
  } catch (error) {
    setReviewPaginationState(gymId, { loadingMore: false });
    throw error;
  }
};

const ensureGymPhotos = async (gymId, options = {}) => {
  const { force = false } = options;
  if (!gymId) return [];
  if (!force && photoMap.value[gymId]) {
    return photoMap.value[gymId] || [];
  }

  const response = await gymApi.gymImagesCombinedReview(gymId);
  const payload = extractPayload(response, {});
  const photos = toImageVariantItems(payload?.images);

  photoMap.value = {
    ...photoMap.value,
    [gymId]: photos,
  };
  return photos;
};

const ensureGymPhotoDetails = async (gymId, options = {}) => {
  const { force = false } = options;
  if (!gymId) return [];
  if (!force && photoDetailMap.value[gymId]) {
    return photoDetailMap.value[gymId] || [];
  }

  const response = await gymApi.gymImagesCombinedReviewDetail(gymId);
  const payload = extractPayload(response, {});
  const photos = toImageVariantItems(payload?.images);

  photoDetailMap.value = {
    ...photoDetailMap.value,
    [gymId]: photos,
  };
  return photos;
};

const normalizeReservationSlots = (payload) => extractList(payload)
  .map((item) => ({
    ...item,
    remainingCount: Number(item?.remainingCount || 0),
    reservedCount: Number(item?.reservedCount || 0),
    maxCapacity: Number(item?.maxCapacity || 0),
  }))
  .sort((left, right) => String(left?.slotDateTime || '').localeCompare(String(right?.slotDateTime || '')));

const normalizeReservationCalendar = (payload) => extractList(payload)
  .map((item) => ({
    date: String(item?.date || '').trim(),
    totalSlotCount: Number(item?.totalSlotCount || 0),
    availableSlotCount: Number(item?.availableSlotCount || 0),
  }))
  .filter((item) => item.date)
  .sort((left, right) => left.date.localeCompare(right.date));

const buildReservationCalendarKey = (gymId, monthDate) =>
  `${gymId}:${formatYearMonthKey(monthDate)}`;

const ensureReservationCalendar = async (gymId, monthDate, options = {}) => {
  const { force = false } = options;
  if (!gymId || !(monthDate instanceof Date)) return {};

  const cacheKey = buildReservationCalendarKey(gymId, monthDate);
  if (!force && reservationCalendarMap.value[cacheKey]) {
    return reservationCalendarMap.value[cacheKey] || {};
  }

  const response = await reservationApi.getCalendar(
    Number(gymId),
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
  );
  const payload = extractPayload(response, []);
  const calendarItems = normalizeReservationCalendar(payload);
  const calendarByDate = calendarItems.reduce((acc, item) => {
    acc[item.date] = item;
    return acc;
  }, {});

  reservationCalendarMap.value = {
    ...reservationCalendarMap.value,
    [cacheKey]: calendarByDate,
  };

  return calendarByDate;
};

const syncReservationCalendarDay = (gymId, date, slots = []) => {
  const targetDate = parseDateOnly(date);
  if (!gymId || !targetDate) return;

  const monthDate = startOfMonth(targetDate);
  const cacheKey = buildReservationCalendarKey(gymId, monthDate);
  const currentMonthCalendar = reservationCalendarMap.value[cacheKey] || {};
  const availableSlotCount = slots.filter((slot) => !isReservationSlotUnavailable(slot)).length;

  reservationCalendarMap.value = {
    ...reservationCalendarMap.value,
    [cacheKey]: {
      ...currentMonthCalendar,
      [date]: {
        date,
        totalSlotCount: slots.length,
        availableSlotCount,
      },
    },
  };
};

const ensureReservationSlots = async (gymId, date, options = {}) => {
  const { force = false } = options;
  if (!gymId || !date) return [];

  const cacheKey = `${gymId}:${date}`;
  if (!force && reservationSlotMap.value[cacheKey]) {
    return reservationSlotMap.value[cacheKey] || [];
  }

  const response = await reservationApi.getSlots(Number(gymId), date);
  const payload = extractPayload(response, []);
  const slots = normalizeReservationSlots(payload);

  reservationSlotMap.value = {
    ...reservationSlotMap.value,
    [cacheKey]: slots,
  };
  syncReservationCalendarDay(gymId, date, slots);
  return slots;
};

const toApiErrorMessage = (error, fallback = '리뷰 등록에 실패했습니다.') => {
  const status = Number(error?.response?.status || 0);
  const message = String(
    error?.response?.data?.message
    || error?.response?.data?.error
    || error?.response?.data?.result
    || '',
  ).trim();
  if (status === 401) return '로그인이 필요합니다.';
  if (status === 403) return '일반 사용자(USER)만 리뷰를 작성할 수 있습니다.';
  return message || fallback;
};

const toReservationErrorMessage = (error, fallback = '예약 처리에 실패했습니다.') => {
  const status = Number(error?.response?.status || 0);
  const message = String(
    error?.response?.data?.message
    || error?.response?.data?.error
    || error?.response?.data?.result
    || '',
  ).trim();
  if (status === 401) return '로그인이 필요합니다.';
  if (status === 403) return '예약 권한이 없습니다.';
  return message || fallback;
};

const resetReservationFeedback = () => {
  reservationFeedbackMessage.value = '';
  reservationFeedbackTone.value = 'info';
};

const resetReservationFilters = () => {
  reservationMonthCursor.value = startOfMonth(new Date());
  reservationSelectedDate.value = '';
  reservationSelectedSlotDateTime.value = '';
  resetReservationFeedback();
};

const isReservationDateSelectable = (dateString, availabilityMap = reservationMonthAvailability.value) => {
  if (!dateString || isDateBeforeToday(dateString)) return false;
  const daySummary = availabilityMap?.[dateString];
  return Number(daySummary?.availableSlotCount || 0) > 0;
};

const findFirstSelectableDateInMonth = (availabilityMap = reservationMonthAvailability.value) => Object.values(availabilityMap)
  .filter((item) => isReservationDateSelectable(item?.date, availabilityMap))
  .sort((left, right) => String(left?.date || '').localeCompare(String(right?.date || '')))[0]?.date || '';

const syncSelectedReservationDateForMonth = (monthDate, availabilityMap = reservationMonthAvailability.value) => {
  const selectedDate = parseDateOnly(reservationSelectedDate.value);
  if (selectedDate && isSameMonth(selectedDate, monthDate) && isReservationDateSelectable(reservationSelectedDate.value, availabilityMap)) {
    return reservationSelectedDate.value;
  }

  const firstSelectableDate = findFirstSelectableDateInMonth(availabilityMap);
  reservationSelectedDate.value = firstSelectableDate;
  reservationSelectedSlotDateTime.value = '';
  return firstSelectableDate;
};

const syncSelectedReservationSlot = () => {
  if (!reservationSelectedSlotDateTime.value) return;
  const isStillSelectable = reservationSlots.value.some((slot) =>
    slot?.slotDateTime === reservationSelectedSlotDateTime.value && !isReservationSlotUnavailable(slot));
  if (!isStillSelectable) {
    reservationSelectedSlotDateTime.value = '';
  }
};

const loadReservationSlotsForSelectedDate = async (options = {}) => {
  const gymId = selectedGymId.value;
  const date = reservationSelectedDate.value;
  if (!gymId || !date) {
    reservationSelectedSlotDateTime.value = '';
    return [];
  }

  tabLoading.value = true;
  tabError.value = '';
  try {
    const slots = await ensureReservationSlots(gymId, date, options);
    const updatedAvailabilityMap = reservationCalendarMap.value[buildReservationCalendarKey(gymId, reservationMonthCursor.value)] || {};
    if (!isReservationDateSelectable(date, updatedAvailabilityMap)) {
      const nextDateString = syncSelectedReservationDateForMonth(reservationMonthCursor.value, updatedAvailabilityMap);
      if (nextDateString && nextDateString !== date) {
        return loadReservationSlotsForSelectedDate(options);
      }
    }
    syncSelectedReservationSlot();
    return slots;
  } catch (error) {
    console.error('Failed to load reservation slots:', error);
    tabError.value = '예약 가능한 시간을 불러오지 못했습니다.';
    throw error;
  } finally {
    tabLoading.value = false;
  }
};

const loadReservationCalendarForMonth = async (monthDate, options = {}) => {
  const gymId = selectedGymId.value;
  if (!gymId) return {};

  tabLoading.value = true;
  tabError.value = '';
  try {
    return await ensureReservationCalendar(gymId, monthDate, options);
  } catch (error) {
    console.error('Failed to load reservation calendar:', error);
    tabError.value = '예약 가능한 날짜를 불러오지 못했습니다.';
    throw error;
  } finally {
    tabLoading.value = false;
  }
};

const moveReservationMonth = async (offset) => {
  const nextMonth = addMonths(reservationMonthCursor.value, offset);
  reservationMonthCursor.value = nextMonth;
  reservationSelectedSlotDateTime.value = '';
  resetReservationFeedback();

  if (activeTab.value === '예약') {
    const availabilityMap = await loadReservationCalendarForMonth(nextMonth);
    const nextDateString = syncSelectedReservationDateForMonth(nextMonth, availabilityMap);
    if (nextDateString) {
      await loadReservationSlotsForSelectedDate({ force: true });
    }
    return;
  }

  const availabilityMap = await ensureReservationCalendar(selectedGymId.value, nextMonth);
  syncSelectedReservationDateForMonth(nextMonth, availabilityMap);
};

const selectReservationDate = async (dateString) => {
  if (!isReservationDateSelectable(dateString)) return;
  const targetDate = parseDateOnly(dateString);
  if (!targetDate) return;

  reservationMonthCursor.value = startOfMonth(targetDate);
  if (reservationSelectedDate.value === dateString && activeTab.value !== '예약') return;
  reservationSelectedDate.value = dateString;
  reservationSelectedSlotDateTime.value = '';
  resetReservationFeedback();

  if (activeTab.value === '예약') {
    await loadReservationSlotsForSelectedDate({ force: true });
  }
};

const selectReservationSlot = (slot) => {
  if (isReservationSlotUnavailable(slot)) return;
  reservationSelectedSlotDateTime.value = slot?.slotDateTime || '';
  resetReservationFeedback();
};

const getReservationSlotMeta = (slot) => {
  if (Boolean(slot?.isClosed) || Number(slot?.remainingCount || 0) <= 0) return '마감';
  if (parseLocalDateTime(slot?.slotDateTime)?.getTime() < Date.now()) return '종료';
  return `잔여 ${Number(slot?.remainingCount || 0)}석`;
};

const submitReservation = async () => {
  const gymId = Number(selectedGymId.value || 0);
  const slot = selectedReservationSlot.value;
  if (!gymId || !slot) return;

  if (!isAuthenticated.value) {
    if (typeof props.onRequireAuth === 'function') {
      props.onRequireAuth();
      return;
    }
    window.alert('로그인이 필요합니다.');
    return;
  }

  reservationSubmitting.value = true;
  resetReservationFeedback();
  try {
    await reservationApi.create({
      gymId,
      reservationDateTime: slot.slotDateTime,
    });
    reservationSelectedSlotDateTime.value = '';
    reservationFeedbackTone.value = 'success';
    reservationFeedbackMessage.value = '예약이 접수되었습니다. 마이페이지에서 예약 내역을 확인할 수 있습니다.';
    const availabilityMap = await loadReservationCalendarForMonth(reservationMonthCursor.value, { force: true });
    const nextDateString = syncSelectedReservationDateForMonth(reservationMonthCursor.value, availabilityMap);
    if (nextDateString) {
      await loadReservationSlotsForSelectedDate({ force: true });
    }
  } catch (error) {
    reservationFeedbackTone.value = 'error';
    reservationFeedbackMessage.value = toReservationErrorMessage(error);
  } finally {
    reservationSubmitting.value = false;
  }
};

const revokeReviewImageUrls = (items = reviewForm.value.images || []) => {
  items.forEach((item) => {
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
};

const resetReviewForm = () => {
  revokeReviewImageUrls();
  reviewModalMode.value = 'create';
  editingReviewId.value = null;
  reviewExistingImages.value = [];
  reviewForm.value = {
    rating: 5,
    comment: '',
    images: [],
  };
  if (reviewImageInputRef.value) {
    reviewImageInputRef.value.value = '';
  }
};

const openReviewFilePicker = () => {
  reviewImageInputRef.value?.click();
};

const openReportModal = (review) => {
  const targetId = Number(review?.reviewId || review?.id || 0);
  if (!targetId) return;
  if (!isAuthenticated.value) {
    if (typeof props.onRequireAuth === 'function') {
      props.onRequireAuth();
      return;
    }
    window.alert('로그인이 필요합니다.');
    return;
  }

  reportTargetRefId.value = targetId;
  reportReason.value = '';
  reportErrorMessage.value = '';
  isSubmittingReport.value = false;
  isReportModalOpen.value = true;
};

const closeReportModal = (force = false) => {
  if (isSubmittingReport.value && !force) return;
  isReportModalOpen.value = false;
  reportReason.value = '';
  reportErrorMessage.value = '';
  reportTargetRefId.value = null;
};

const submitReport = async () => {
  const targetId = Number(reportTargetRefId.value || 0);
  if (!targetId) return;
  const reason = String(reportReason.value || '').trim();
  if (reason.length < 5 || reason.length > 500) {
    reportErrorMessage.value = '신고 사유는 5자 이상 500자 이하로 입력해주세요.';
    return;
  }

  reportErrorMessage.value = '';
  isSubmittingReport.value = true;
  try {
    await reportApi.create({
      refId: targetId,
      refType: 'REVIEW',
      reason,
    });
    closeReportModal(true);
    showShareToast('신고가 접수되었습니다.');
  } catch (error) {
    reportErrorMessage.value = '신고 처리에 실패했습니다.';
  } finally {
    isSubmittingReport.value = false;
  }
};

const getFileExtension = (filename = '') => {
  const normalized = String(filename || '').trim().toLowerCase();
  const lastDotIndex = normalized.lastIndexOf('.');
  if (lastDotIndex < 0) return '';
  return normalized.slice(lastDotIndex + 1);
};

const isHeicFamilyFile = (file) => {
  const contentType = String(file?.type || '').toLowerCase();
  const ext = getFileExtension(file?.name || '');
  return contentType.includes('heic')
    || contentType.includes('heif')
    || ext === 'heic'
    || ext === 'heif';
};

const isSupportedReviewImage = (file) => {
  const contentType = String(file?.type || '').toLowerCase();
  const ext = getFileExtension(file?.name || '');
  return allowedReviewImageMimeTypes.has(contentType) || allowedReviewImageExtensions.has(ext);
};

const onReviewFilesChange = (event) => {
  const incomingFiles = Array.from(event?.target?.files || []);
  if (incomingFiles.length === 0) return;

  const heicFiles = incomingFiles.filter((file) => isHeicFamilyFile(file));
  const unsupportedFiles = incomingFiles.filter((file) => !isHeicFamilyFile(file) && !isSupportedReviewImage(file));
  const validFiles = incomingFiles.filter((file) => isSupportedReviewImage(file));

  if (heicFiles.length > 0 || unsupportedFiles.length > 0) {
    const messages = [];
    if (heicFiles.length > 0) {
      messages.push('HEIC/HEIF 형식은 지원되지 않습니다. 아이폰은 카메라 설정에서 "높은 호환성(JPG)"으로 변경해주세요.');
    }
    if (unsupportedFiles.length > 0) {
      messages.push('JPG/PNG 형식만 업로드할 수 있습니다.');
    }
    reviewSubmitError.value = messages.join(' ');
  }

  if (validFiles.length === 0) {
    if (reviewImageInputRef.value) {
      reviewImageInputRef.value.value = '';
    }
    return;
  }

  const remaining = maxReviewImageCount - reviewForm.value.images.length;
  if (remaining <= 0) {
    reviewSubmitError.value = '사진은 최대 10장까지 업로드할 수 있습니다.';
    if (reviewImageInputRef.value) {
      reviewImageInputRef.value.value = '';
    }
    return;
  }

  const selected = validFiles.slice(0, remaining).map((file) => ({
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  }));

  reviewForm.value.images = [...reviewForm.value.images, ...selected];
  if (validFiles.length > remaining) {
    reviewSubmitError.value = '사진은 최대 10장까지 업로드할 수 있습니다.';
  } else if (reviewSubmitError.value === '') {
    reviewSubmitError.value = '';
  }
  if (reviewImageInputRef.value) {
    reviewImageInputRef.value.value = '';
  }
};

const removeReviewFile = (index) => {
  const target = reviewForm.value.images[index];
  if (target?.previewUrl) {
    URL.revokeObjectURL(target.previewUrl);
  }
  reviewForm.value.images = reviewForm.value.images.filter((_, imageIndex) => imageIndex !== index);
};

const openReviewModal = () => {
  if (!isAuthenticated.value) {
    if (typeof props.onRequireAuth === 'function') {
      props.onRequireAuth();
      return;
    }
    window.alert('로그인이 필요합니다.');
    return;
  }
  if (!canWriteReview.value) {
    window.alert('일반 사용자(USER)만 리뷰를 작성할 수 있습니다.');
    return;
  }
  reviewSubmitError.value = '';
  resetReviewForm();
  isReviewModalOpen.value = true;
};

const openEditReviewModal = async (review) => {
  if (!review?.canEdit) return;
  const reviewId = review.reviewId ?? review.id ?? null;
  if (!reviewId) return;

  reviewSubmitError.value = '';
  resetReviewForm();
  reviewModalMode.value = 'edit';
  editingReviewId.value = reviewId;

  try {
    const detail = await ensureReviewDetail(reviewId);
    const reviewSource = detail || review;
    reviewExistingImages.value = toOriginalImageUrls(reviewSource?.images);
    reviewForm.value = {
      rating: Number(reviewSource?.rating || 5),
      comment: String(reviewSource?.comment || review.commentText || review.comment || ''),
      images: [],
    };
    if (reviewImageInputRef.value) {
      reviewImageInputRef.value.value = '';
    }
    isReviewModalOpen.value = true;
  } catch (error) {
    reviewSubmitError.value = toApiErrorMessage(error);
    reviewModalMode.value = 'create';
    editingReviewId.value = null;
  }
};

const closeReviewModal = () => {
  if (isReviewSubmitting.value) return;
  isReviewModalOpen.value = false;
  reviewSubmitError.value = '';
  resetReviewForm();
};

const toggleReviewExpanded = (review) => {
  const reviewKey = String(review?.reviewKey || getReviewKey(review));
  if (!reviewKey) return;
  reviewExpandedMap.value = {
    ...reviewExpandedMap.value,
    [reviewKey]: !reviewExpandedMap.value[reviewKey],
  };
};

const updatePhotoViewerViewport = () => {
  const isMobileViewport = window.innerWidth <= 1024 && props.mobileSheetState === 'full';
  isPhotoViewerMobile.value = isMobileViewport;
  if (!isMobileViewport) {
    isPhotoViewerControlsVisible.value = true;
  }
};

const openPhotoViewerWithItems = (items, index = 0, source = 'gallery') => {
  const normalizedItems = toOriginalImageUrls(items);
  if (!normalizedItems.length) return;
  updatePhotoViewerViewport();
  const clampedIndex = Math.min(Math.max(index, 0), normalizedItems.length - 1);
  photoViewerItems.value = normalizedItems;
  photoViewerSource.value = source;
  selectedPhotoIndex.value = clampedIndex;
  isPhotoViewerControlsVisible.value = true;
  isPhotoViewerOpen.value = true;
};

const openPhotoViewer = (index) => {
  openGymPhotoViewer(index);
};

const openReviewPhotoViewer = async (review, index = 0) => {
  const reviewId = review?.reviewId ?? review?.id ?? null;
  if (!reviewId) {
    openPhotoViewerWithItems(review?.imageItems || [], index, 'review');
    return;
  }

  try {
    const detail = await ensureReviewDetail(reviewId);
    const originalItems = toImageVariantItems(detail?.images);
    openPhotoViewerWithItems(originalItems.length ? originalItems : review?.imageItems || [], index, 'review-detail');
  } catch (error) {
    openPhotoViewerWithItems(review?.imageItems || [], index, 'review');
  }
};

const openGymPhotoViewer = async (index = 0) => {
  const gymId = selectedGymId.value;
  if (!gymId) {
    openPhotoViewerWithItems(photoItems.value, index, 'gallery');
    return;
  }

  try {
    const originalItems = await ensureGymPhotoDetails(gymId);
    openPhotoViewerWithItems(originalItems.length ? originalItems : photoItems.value, index, 'photo-detail');
  } catch (error) {
    openPhotoViewerWithItems(photoItems.value, index, 'gallery');
  }
};

const closePhotoViewer = () => {
  isPhotoViewerOpen.value = false;
  isPhotoViewerControlsVisible.value = true;
  selectedPhotoIndex.value = -1;
  photoViewerItems.value = [];
  photoViewerSource.value = 'gallery';
};

const togglePhotoViewerControls = () => {
  if (!isPhotoViewerMobile.value) return;
  isPhotoViewerControlsVisible.value = !isPhotoViewerControlsVisible.value;
};

const showPrevPhoto = () => {
  if (!photoViewerItems.value.length) return;
  selectedPhotoIndex.value = (selectedPhotoIndex.value - 1 + photoViewerItems.value.length) % photoViewerItems.value.length;
};

const showNextPhoto = () => {
  if (!photoViewerItems.value.length) return;
  selectedPhotoIndex.value = (selectedPhotoIndex.value + 1) % photoViewerItems.value.length;
};

const onPhotoViewerKeydown = (event) => {
  if (!isPhotoViewerOpen.value) return;
  if (event.key === 'Escape') {
    closePhotoViewer();
    return;
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showPrevPhoto();
    return;
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    showNextPhoto();
  }
};

const submitReview = async () => {
  const gymId = Number(selectedGymId.value || 0);
  const comment = String(reviewForm.value.comment || '').trim();
  if ((!gymId && !isEditingReview.value) || !comment) return;

  isReviewSubmitting.value = true;
  reviewSubmitError.value = '';
  try {
    const payload = {
      review: {
        rating: Number(reviewForm.value.rating || 5),
        comment,
      },
      images: reviewForm.value.images.map((item) => item.file),
    };

    if (isEditingReview.value && editingReviewId.value != null) {
      await reviewApi.edit(editingReviewId.value, payload);
    } else {
      await reviewApi.create({
        ...payload,
        review: {
          ...payload.review,
          gymId,
        },
      });
    }

    isReviewModalOpen.value = false;
    if (editingReviewId.value != null) {
      const nextReviewDetailMap = { ...reviewDetailMap.value };
      delete nextReviewDetailMap[editingReviewId.value];
      reviewDetailMap.value = nextReviewDetailMap;
    }
    if (gymId) {
      const nextPhotoDetailMap = { ...photoDetailMap.value };
      delete nextPhotoDetailMap[gymId];
      photoDetailMap.value = nextPhotoDetailMap;
    }
    resetReviewForm();
    await ensureGymDetail(String(gymId), { force: true });
    await ensureGymReviews(String(gymId), { force: true });
    await ensureGymPhotos(String(gymId), { force: true });
    if (activeTab.value === '리뷰') {
      await nextTick();
      await ensureReviewFeedScrollable();
    }
  } catch (error) {
    reviewSubmitError.value = toApiErrorMessage(error);
  } finally {
    isReviewSubmitting.value = false;
  }
};

const submitSearch = () => {
  if (typeof props.onSearchGyms === 'function') {
    props.onSearchGyms(searchQuery.value.trim());
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  if (typeof props.onSearchGyms === 'function') {
    props.onSearchGyms('');
  }
};

const hideMobileSheet = () => {
  if (typeof props.onSetMobileSheetState === 'function') {
    props.onSetMobileSheetState('hidden');
  }
};

const toggleMobileSheetByHandle = () => {
  if (typeof props.onSetMobileSheetState !== 'function') return;
  if (props.mobileSheetState === 'full') {
    props.onSetMobileSheetState('peek');
  } else {
    props.onSetMobileSheetState('full');
  }
};

const onHandleTouchStart = (event) => {
  handleTouchStartY.value = event.changedTouches?.[0]?.clientY ?? null;
};

const onHandleTouchEnd = (event) => {
  if (typeof props.onSetMobileSheetState !== 'function') return;

  const startY = handleTouchStartY.value;
  const endY = event.changedTouches?.[0]?.clientY;
  handleTouchStartY.value = null;

  if (startY == null || endY == null) {
    toggleMobileSheetByHandle();
    return;
  }

  const deltaY = endY - startY;
  if (Math.abs(deltaY) < 20) {
    toggleMobileSheetByHandle();
    return;
  }

  if (deltaY > 40) {
    if (props.mobileSheetState === 'full' && deltaY > 140) {
      props.onSetMobileSheetState('hidden');
    } else if (props.mobileSheetState === 'full') {
      props.onSetMobileSheetState('peek');
    } else if (props.mobileSheetState === 'peek') {
      props.onSetMobileSheetState('hidden');
    }
    return;
  }

  if (deltaY < -40) {
    if (props.mobileSheetState === 'hidden') {
      props.onSetMobileSheetState('peek');
    } else if (props.mobileSheetState === 'peek') {
      props.onSetMobileSheetState('full');
    }
  }
};

const handleTabClick = async (tab) => {
  activeTab.value = tab;
  await nextTick();
  if (detailScrollRef.value) {
    detailScrollRef.value.scrollTo({ top: 0, behavior: 'auto' });
  }
};

const ensureReviewFeedScrollable = async () => {
  if (activeTab.value !== '리뷰' || !selectedGymId.value) return;
  const container = detailScrollRef.value;
  if (!container) return;

  let guard = 0;
  while (reviewHasNextPage.value
    && !reviewIsLoadingMore.value
    && container.scrollHeight <= container.clientHeight + reviewLoadMoreThreshold
    && guard < 6) {
    guard += 1;
    await loadMoreGymReviews(selectedGymId.value);
    await nextTick();
  }
};

const maybeLoadMoreReviews = async () => {
  if (activeTab.value !== '리뷰' || !selectedGymId.value) return;
  if (tabLoading.value || reviewIsLoadingMore.value || !reviewHasNextPage.value) return;

  const container = detailScrollRef.value;
  if (!container) return;

  const remainingDistance = container.scrollHeight - (container.scrollTop + container.clientHeight);
  if (remainingDistance > reviewLoadMoreThreshold) return;

  await loadMoreGymReviews(selectedGymId.value);
  await nextTick();
  await ensureReviewFeedScrollable();
};

const handleDetailScroll = () => {
  if (activeTab.value !== '리뷰') return;
  maybeLoadMoreReviews().catch((error) => {
    console.error('Failed to load more reviews:', error);
  });
};

const loadTabData = async (tab) => {
  const gymId = selectedGymId.value;
  if (!gymId) return;

  tabError.value = '';

  if (tab === '홈') {
    try {
      await ensureGymDetail(gymId, { force: true });
      await ensureGymReviews(gymId, { force: true });
      await ensureGymPhotos(gymId, { force: true });
    } catch (error) {
      console.error('Failed to load gym detail:', error);
    }
    return;
  }

  tabLoading.value = true;
  try {
    if (tab === '예약') {
      const availabilityMap = await ensureReservationCalendar(gymId, reservationMonthCursor.value);
      const nextDateString = syncSelectedReservationDateForMonth(reservationMonthCursor.value, availabilityMap);
      if (!nextDateString) {
        reservationSelectedSlotDateTime.value = '';
        return;
      }
      await loadReservationSlotsForSelectedDate();
      return;
    }

    if (tab === '리뷰') {
      await ensureGymReviews(gymId);
      await nextTick();
      await ensureReviewFeedScrollable();
      return;
    }

    if (tab === '사진') {
      await ensureGymPhotos(gymId, { force: true });
    }
  } catch (error) {
    console.error(`Failed to load ${tab} tab data:`, error);
    tabError.value = `${tab} 정보를 불러오지 못했습니다.`;
  } finally {
    tabLoading.value = false;
  }
};

const resetReservationSelection = async () => {
  resetReservationFilters();
  if (activeTab.value !== '예약') return;

  const availabilityMap = await loadReservationCalendarForMonth(reservationMonthCursor.value, { force: true });
  const nextDateString = syncSelectedReservationDateForMonth(reservationMonthCursor.value, availabilityMap);
  if (!nextDateString) return;
  await loadReservationSlotsForSelectedDate({ force: true });
};

const onRequestArriveDirection = () => {
  if (!props.selectedGym) return;
  if (typeof props.onArriveDirection === 'function') {
    props.onArriveDirection(props.selectedGym);
  }
};

const filteredGyms = computed(() => props.gyms);

const clearShareToast = () => {
  if (shareToastTimer) {
    clearTimeout(shareToastTimer);
    shareToastTimer = null;
  }
  shareToastMessage.value = '';
};

const showShareToast = (message, tone = 'success') => {
  clearShareToast();
  shareToastTone.value = tone;
  shareToastMessage.value = message;
  shareToastTimer = setTimeout(() => {
    shareToastMessage.value = '';
    shareToastTimer = null;
  }, 2200);
};

const getActiveTabFromRoute = () => {
  const routeTab = String(route.query.t ?? route.query.tab ?? '').trim();
  return tabQueryLabelMap[routeTab] || '홈';
};

const syncDetailTabQuery = (tab) => {
  if (!selectedGymId.value) return;

  const nextQuery = {
    ...route.query,
    g: selectedGymId.value,
    t: tabQueryValueMap[tab] || tabQueryValueMap['홈'],
  };
  delete nextQuery.gymId;
  delete nextQuery.tab;

  const currentGymId = String(route.query.g ?? route.query.gymId ?? '');
  const currentTab = String(route.query.t ?? route.query.tab ?? '');
  if (currentGymId === String(nextQuery.g) && currentTab === String(nextQuery.t)) return;

  router.replace({ path: route.path, query: nextQuery }).catch(() => {});
};

const buildGymShareUrl = (tab) => {
  const nextQuery = {
    ...route.query,
    g: selectedGymId.value,
    t: tabQueryValueMap[tab] || tabQueryValueMap['홈'],
  };
  delete nextQuery.gymId;
  delete nextQuery.tab;

  const resolved = router.resolve({
    path: route.path,
    query: nextQuery,
  });

  return new URL(resolved.fullPath, window.location.origin).toString();
};

const copyTextToClipboard = async (text) => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error('Clipboard copy failed');
  }
};

const handleShareGym = async () => {
  if (!selectedGymId.value) return;

  try {
    const shareUrl = buildGymShareUrl(activeTab.value);
    await copyTextToClipboard(shareUrl);
    showShareToast('링크가 복사되었습니다.');
  } catch (error) {
    console.error('Failed to copy share link:', error);
    showShareToast('링크 복사에 실패했습니다.', 'error');
  }
};

const startChatWithGymOwner = async () => {
  const gymOwnerId = Number(
    selectedGymDetail.value?.ownerId || 
    props.selectedGym?.ownerId || 
    selectedGymDetail.value?.userId || 
    props.selectedGym?.userId || 
    0
  );
  
  if (!gymOwnerId) {
    window.alert('해당 헬스장 사장님 정보를 찾을 수 없습니다.');
    return;
  }
  
  if (!isAuthenticated.value) {
    if (typeof props.onRequireAuth === 'function') {
      props.onRequireAuth();
      return;
    }
    window.alert('로그인이 필요합니다.');
    return;
  }

  if (gymOwnerId === Number(sessionUserId.value)) {
    window.alert('본인의 헬스장입니다.');
    return;
  }

  isCreatingChat.value = true;
  try {
    const response = await chatApi.createRoom({ otherUserId: gymOwnerId });
    const roomSummary = extractPayload(response);
    const roomKey = String(roomSummary?.roomKey || '').trim();
    savePendingChatRoom(roomSummary);
    await router.push(roomKey
      ? { path: '/chat', query: { roomKey } }
      : { path: '/chat' });
  } catch (error) {
    console.error('Failed to create chat room:', error);
    window.alert('채팅방 생성에 실패했습니다.');
  } finally {
    isCreatingChat.value = false;
  }
};

watch(selectedGymId, async (nextGymId, prevGymId) => {
  tabError.value = '';
  tabLoading.value = false;
  resetReservationFilters();
  reviewExpandedMap.value = {};
  if (nextGymId !== prevGymId && isReviewModalOpen.value) {
    closeReviewModal();
  }
  if (nextGymId !== prevGymId && isPhotoViewerOpen.value) {
    closePhotoViewer();
  }

  if (!nextGymId) return;
  const nextTab = getActiveTabFromRoute();
  if (nextGymId !== prevGymId) {
    if (activeTab.value !== nextTab) {
      activeTab.value = nextTab;
      return;
    }
  }

  await loadTabData(nextTab);
}, { immediate: true });

watch(activeTab, async (tab) => {
  if (selectedGymId.value) {
    syncDetailTabQuery(tab);
  }
  await loadTabData(tab);
});

watch(() => [route.query.t, route.query.tab], ([nextShortTab, nextLongTab]) => {
  if (!selectedGymId.value) return;
  const nextTab = tabQueryLabelMap[String(nextShortTab ?? nextLongTab ?? '').trim()] || '홈';
  if (nextTab === activeTab.value) return;
  activeTab.value = nextTab;
});

watch(photoItems, (nextItems) => {
  if (!isPhotoViewerOpen.value || photoViewerSource.value !== 'gallery') return;
  const normalizedItems = toOriginalImageUrls(nextItems);
  if (!normalizedItems.length) {
    closePhotoViewer();
    return;
  }
  photoViewerItems.value = normalizedItems;
  if (selectedPhotoIndex.value >= normalizedItems.length) {
    selectedPhotoIndex.value = normalizedItems.length - 1;
  }
});

watch(() => props.searchKeyword, (nextKeyword) => {
  searchQuery.value = String(nextKeyword || '');
}, { immediate: true });

watch(() => props.mobileSheetState, () => {
  updatePhotoViewerViewport();
});

onMounted(() => {
  primeSessionFromToken();
  if (isAuthenticated.value) {
    syncSessionFromServer().catch(() => {});
  }
  updatePhotoViewerViewport();
  window.addEventListener('keydown', onPhotoViewerKeydown);
  window.addEventListener('resize', updatePhotoViewerViewport);
});

onBeforeUnmount(() => {
  revokeReviewImageUrls();
  clearShareToast();
  window.removeEventListener('keydown', onPhotoViewerKeydown);
  window.removeEventListener('resize', updatePhotoViewerViewport);
});
</script>
