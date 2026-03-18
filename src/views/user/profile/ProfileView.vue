<template>
  <div class="screen-rail-slate">
    <NavigationRail />

    <div class="sx-views-user-profile-profilehistoryview-001">
      <div class="v-profile-page-wrap">
        <div v-if="isGymOwner" class="v-owner-wrap">
          <div class="view-card v-owner-hero-card">
            <div class="v-owner-head">
              <div class="v-owner-profile-summary">
                <div class="v-profile-avatar-frame">
                  <img
                    :src="gymOwnerImages[0]?.url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&auto=format&fit=crop'"
                    alt="짐 이미지"
                    class="v-cover-image"
                  />
                </div>
                <div class="v-profile-head-content">
                  <h1 class="v-profile-head-name">{{ gymOwnerForm.name || '내 헬스장' }}</h1>
                  <p class="sx-views-user-profile-profileview-004">{{ gymOwnerForm.description || '등록된 소개가 없습니다.' }}</p>
                  <div class="v-profile-stat-row">
                    <div class="v-profile-stat-item"><span class="v-profile-stat-value">상품</span><span class="u-text-muted-sm">{{ gymOwnerProducts.length }}개</span></div>
                    <div class="v-profile-stat-item"><span class="v-profile-stat-value">편의시설</span><span class="u-text-muted-sm">{{ amenityCount }}개</span></div>
                    <div class="v-profile-stat-item"><span class="v-profile-stat-value">예외일정</span><span class="u-text-muted-sm">{{ gymOwnerExceptions.length }}건</span></div>
                  </div>
                </div>
              </div>

              <RouterLink
                v-if="isOwnProfile"
                :to="gymOwnerEditLink"
                class="v-profile-action-secondary v-profile-action-btn v-profile-edit-link-btn v-owner-head-action"
              >
                시설 정보 수정
              </RouterLink>
              <div v-else class="u-flex u-gap-2 u-flex-wrap" style="justify-content: flex-end;">
                <button
                  class="v-profile-action-primary v-profile-action-btn v-owner-head-action"
                  :disabled="isCreatingChat || !canStartChat"
                  @click="startChatWithUser"
                >
                  {{ isCreatingChat ? '연결 중...' : '상담하기' }}
                </button>
                <button
                  class="v-profile-action-secondary v-profile-action-btn v-owner-head-action"
                  :disabled="isFavoriteBusy"
                  @click="toggleGymFavorite"
                >
                  {{ isFavoriteBusy ? '처리 중...' : (isFavoriteGym ? '즐겨찾기 해제' : '즐겨찾기') }}
                </button>
              </div>
            </div>
          </div>

          <div class="sx-views-user-profile-profileview-015">
            <div class="v-profile-log-column">
              <div class="v-owner-info-grid">
                <div class="view-card-sm v-owner-panel-card">
                  <h3 class="v-owner-panel-title">영업 시간</h3>
                  <div class="v-owner-read-hours">
                    <div v-for="item in gymOwnerHours" :key="item.dayOfWeek" class="v-owner-read-hour-row">
                      <span>{{ dayLabelMap[item.dayOfWeek] }}</span>
                      <strong>{{ item.isClosed ? '휴무' : `${item.openTime} ~ ${item.closeTime}` }}</strong>
                    </div>
                  </div>
                </div>

                <div class="view-card-sm v-owner-panel-card v-owner-products-card">
                  <h3 class="v-owner-panel-title">상품</h3>
                  <div v-if="gymOwnerProducts.length" class="v-owner-read-products">
                    <p v-for="(item, idx) in gymOwnerProducts" :key="idx" class="v-owner-read-product">
                      <span>{{ item.productName || '-' }}</span>
                      <strong>{{ Number(item.price || 0).toLocaleString() }}원</strong>
                    </p>
                  </div>
                  <p v-else class="v-owner-read-text">등록된 상품이 없습니다.</p>
                </div>
              </div>

              <div class="v-owner-info-grid">
                <div class="view-card-sm v-owner-panel-card">
                  <h3 class="v-owner-panel-title">짐 이미지</h3>
                  <div v-if="gymOwnerImages.length > 0" class="v-owner-image-grid">
                    <div v-for="image in gymOwnerImages" :key="image.key" class="v-owner-image-card">
                      <img :src="image.url" alt="짐 이미지" class="v-owner-image-thumb" />
                    </div>
                  </div>
                  <p v-else class="v-owner-read-text">등록된 이미지가 없습니다.</p>
                </div>

                <div class="view-card-sm v-owner-panel-card">
                  <div class="sx-views-user-profile-profileview-016">
                    <h3 class="v-owner-panel-title" style="margin-bottom: 0;">예약 슬롯 현황</h3>
                    <input type="date" v-model="selectedSlotDate" @change="loadGymSlots" class="v-modal-line-input" style="width: auto; padding: 2px 8px; min-height: 32px; font-size: 13px;" />
                  </div>
                  <div v-if="gymOwnerSlots.length > 0" class="v-owner-row-gap" style="margin-top: 12px; max-height: 200px; overflow-y: auto; padding-right: 4px;">
                    <div v-for="slot in gymOwnerSlots" :key="slot.id" class="v-owner-exception-row">
                      <div class="u-flex u-justify-between u-items-start">
                        <div>
                          <p class="v-owner-exception-date">{{ formatGymOwnerTime(slot.slotDateTime) }} ~ {{ formatGymOwnerTime(slot.endTime) }}</p>
                          <p class="v-owner-exception-help">
                            {{ slot.slotName }} ({{ slot.price.toLocaleString() }}원)
                          </p>
                        </div>
                        <div style="text-align: right;">
                          <span class="v-profile-activity-pill" :class="slot.remainingCount > 0 ? 'v-profile-activity-pill-green' : 'v-profile-activity-pill-gray'" style="min-height: 24px; padding: 0 10px; font-size: 11px;">
                            {{ slot.remainingCount > 0 ? `잔여 ${slot.remainingCount}명` : '마감' }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- 예약자 명단 표시 -->
                      <div v-if="slot.reservations && slot.reservations.length > 0" class="v-owner-booked-users-wrap">
                        <p class="v-owner-booked-label">예약자 명단:</p>
                        <div class="v-owner-booked-list">
                          <span v-for="res in slot.reservations" :key="res.id || res.reservationId" class="v-owner-booked-user-chip">
                            {{ res.userNickname || res.userName || res.displayName || '사용자' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-else class="v-owner-read-text" style="margin-top: 12px;">해당 날짜에 생성된 예약 슬롯이 없습니다.</p>
                </div>
              </div>
            </div>

            <div class="ux-views-user-profile-profileview-001">
              <div class="view-card-sm v-owner-panel-card">
                <h3 class="v-owner-panel-title">기본 정보</h3>
                <div class="v-owner-read-grid">
                  <p class="v-owner-read-item"><span>전화번호</span><strong>{{ gymOwnerForm.tel || '-' }}</strong></p>
                  <p class="v-owner-read-item"><span>카테고리</span><strong>{{ gymOwnerCategoryName }}</strong></p>
                  <p class="v-owner-read-item v-owner-read-item-full"><span>주소</span><strong>{{ gymOwnerForm.address || '-' }}</strong></p>
                </div>
              </div>

              <div class="view-card-sm v-owner-panel-card">
                <h3 class="v-owner-panel-title">편의시설</h3>
                <p class="v-owner-read-text">{{ gymOwnerAmenitiesInput || '-' }}</p>
              </div>

              <div class="view-card-sm v-owner-panel-card">
                <h3 class="v-owner-panel-title">예외 운영시간</h3>
                <div v-if="gymOwnerExceptions.length" class="v-owner-row-gap">
                  <div v-for="item in gymOwnerExceptions" :key="item.id" class="v-owner-exception-row">
                    <div>
                      <p class="v-owner-exception-date">{{ item.specificDate || item.date }}</p>
                      <p class="v-owner-exception-help">
                        {{ item.isClosed ? '휴무' : `${formatGymOwnerTime(item.openTime)} ~ ${formatGymOwnerTime(item.closeTime)}` }}
                        <template v-if="item.description"> · {{ item.description }}</template>
                      </p>
                    </div>
                  </div>
                </div>
                <p v-else class="v-owner-read-text">등록된 예외 운영시간이 없습니다.</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="view-card">
          <div class="sx-views-user-profile-profileview-001">
            <div class="v-profile-head-row v-profile-head-row-fit">
              <div class="sx-views-user-profile-profileview-002">
                <div class="v-profile-avatar-frame">
                  <img :src="displayProfileImage" alt="프로필" class="v-cover-image" @error="handleUserAvatarError" />
                </div>
                <div class="sx-views-user-profile-profileview-003">
                  <CheckCircle2 :size="16" fill="currentColor" class="v-text-white" />
                </div>
              </div>

              <div class="v-profile-head-content">
                <div>
                  <h1 class="v-profile-head-name">{{ displayProfileName }}</h1>
                  <p class="sx-views-user-profile-profileview-004">
                    {{ displayProfileBio }}
                  </p>
                </div>

                <div v-if="!shouldMaskPrivateProfile" class="v-profile-stat-row">
                  <button
                    type="button"
                    class="v-profile-stat-item v-profile-stat-button"
                    @click="openFollowListModal('followers')"
                  >
                    <span class="v-profile-stat-value">{{ followerCountText }}</span>
                    <span class="u-text-muted-sm">팔로워</span>
                  </button>
                  <button
                    type="button"
                    class="v-profile-stat-item v-profile-stat-button"
                    @click="openFollowListModal('followings')"
                  >
                    <span class="v-profile-stat-value">{{ followingCountText }}</span>
                    <span class="u-text-muted-sm">팔로잉</span>
                  </button>
                  <div class="v-profile-stat-item"><span class="v-profile-trophy">🏆</span><span class="v-profile-stat-value">8</span><span class="u-text-muted-sm">업적</span></div>
                </div>
              </div>
            </div>

            <div v-if="!shouldMaskPrivateProfile" class="sx-views-user-profile-profileview-005">
              <template v-if="isOwnProfile">
                <RouterLink to="/profile/edit" class="v-profile-action-secondary v-profile-action-btn v-profile-edit-link-btn">
                  프로필 관리
                </RouterLink>
                <button class="v-profile-action-primary v-profile-action-btn" @click="openWorkoutModal">
                  <Plus :size="18" />
                  운동기록 올리기
                </button>
              </template>
              <template v-else>
                <button
                  class="v-profile-action-primary v-profile-action-btn"
                  :disabled="isCreatingChat || !canStartChat"
                  @click="startChatWithUser"
                >
                  {{ isCreatingChat ? '연결 중...' : (canStartChat ? '채팅하기' : '채팅 불가') }}
                </button>
                <button
                  class="v-profile-action-secondary v-profile-action-btn"
                  :disabled="isFollowBusy"
                  @click="toggleFollow"
                >
                  {{ isFollowBusy ? '처리 중...' : (isFollowing ? '팔로잉' : '팔로우') }}
                </button>
              </template>
            </div>
            <p v-else class="v-owner-read-text">비공개 프로필입니다.</p>
          </div>

          <div v-if="!shouldMaskPrivateProfile" class="sx-views-user-profile-profileview-006">
            <div class="sx-views-user-profile-profileview-007">
              <h3 class="v-profile-section-title">{{ selectedHeatmapYear }}년 운동 기록</h3>
              <div class="sx-views-user-profile-profileview-008">
                <span>적음</span>
                <div class="sx-views-user-profile-profileview-009">
                  <div class="v-heatmap-legend-cell v-heatmap-level-0" />
                  <div class="v-heatmap-legend-cell v-heatmap-level-1" />
                  <div class="v-heatmap-legend-cell v-heatmap-level-2" />
                  <div class="v-heatmap-legend-cell v-heatmap-level-3" />
                  <div class="v-heatmap-legend-cell v-heatmap-level-4" />
                </div>
                <span>많음</span>
              </div>
            </div>

            <div class="v-profile-activity-wrap">
              <div ref="heatmapActivityMainRef" class="v-profile-activity-main">
                <div class="v-profile-activity-summary-row">
                  <div class="v-profile-activity-pill-row">
                    <span class="v-profile-activity-pill v-profile-activity-pill-green">
                      {{ heatmapWorkoutDayTotal }}일 운동
                    </span>
                    <span class="v-profile-activity-pill v-profile-activity-pill-orange">
                      🔥 {{ heatmapCurrentStreak }}일 연속
                    </span>
                    <span class="v-profile-activity-pill v-profile-activity-pill-gray">
                      총 {{ heatmapContributionTotal }}회 기록
                    </span>
                  </div>
                  <div ref="heatmapYearDropdownRef" class="v-profile-activity-years">
                    <button
                      type="button"
                      class="v-profile-year-button v-profile-year-button-active"
                      @click="toggleHeatmapYearDropdown"
                    >
                      {{ selectedHeatmapYear }}
                    </button>
                    <div v-if="isHeatmapYearDropdownOpen" class="v-profile-year-dropdown">
                      <button
                        v-for="year in heatmapYearOptions"
                        :key="year"
                        type="button"
                        class="v-profile-year-option"
                        :class="{ 'v-profile-year-option-active': year === selectedHeatmapYear }"
                        @click="changeHeatmapYear(year)"
                      >
                        {{ year }}
                      </button>
                    </div>
                  </div>
                </div>
                <div class="v-profile-activity-grid-wrap" :style="heatmapLayoutStyle">
                  <div class="sx-views-user-profile-profileview-010 v-profile-activity-days">
                    <span v-for="(day, index) in heatmapDayLabels" :key="`heatmap-day-${index}`">{{ day }}</span>
                  </div>
                  <div class="sx-views-user-profile-profileview-011 v-profile-activity-grid-scroll">
                    <div class="v-profile-heatmap-month-row" :style="{ '--heatmap-week-count': heatmapWeekCount }">
                      <span
                        v-for="(label, index) in heatmapMonthLabelByWeek"
                        :key="`month-${index}`"
                        class="v-profile-heatmap-month-cell"
                      >
                        {{ label }}
                      </span>
                    </div>
                    <div class="sx-views-user-profile-profileview-012" :style="{ '--heatmap-week-count': heatmapWeekCount }">
                      <div v-for="(week, i) in heatmapData" :key="i" class="sx-views-user-profile-profileview-013">
                        <button
                          v-for="(val, j) in week"
                          :key="j"
                          type="button"
                          class="v-heatmap-cell"
                          :class="[
                            heatmapColorClass(val),
                            isHeatmapCellClickable(i, j, val) ? 'v-heatmap-cell-clickable' : 'v-heatmap-cell-disabled',
                          ]"
                          :aria-label="getHeatmapAriaLabel(i, j, val) || null"
                          :disabled="!isHeatmapCellClickable(i, j, val)"
                          @mouseenter="showHeatmapTooltip($event, i, j, val)"
                          @mouseleave="hideHeatmapTooltip"
                          @focus="showHeatmapTooltip($event, i, j, val)"
                          @blur="hideHeatmapTooltip"
                          @click="openWorkoutByDate(i, j, val)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="heatmapTooltip.visible"
                  class="v-profile-heatmap-tooltip"
                  :style="{
                    left: `${heatmapTooltip.left}px`,
                    top: `${heatmapTooltip.top}px`,
                  }"
                >
                  {{ heatmapTooltip.text }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isGymOwner && !shouldMaskPrivateProfile" class="sx-views-user-profile-profileview-015">
          <div class="v-profile-log-column">
            <div class="view-card">
              <div class="sx-views-user-profile-profileview-016">
                <div class="sx-views-user-profile-profileview-017">
                  <History :size="20" class="v-text-brand" />
                  최근 운동 기록
                </div>
                <RouterLink :to="profileWorkoutHistoryLink" class="v-profile-view-all-link">전체 보기</RouterLink>
              </div>

              <div class="u-col-gap-4">
                <p v-if="logs.length === 0" class="v-profile-log-empty">
                  운동 기록이 없습니다.<br />
                  기록을 등록하고 다른 사용자들과 운동 루틴을 공유해보세요.
                </p>
                <div v-for="log in logs" :key="log.id" class="sx-views-user-profile-profileview-018 v-profile-log-item v-profile-log-item-group">
                  <div class="sx-views-user-profile-profileview-019">
                    <div class="u-flex-1-min">
                      <h4 class="sx-views-user-profile-profileview-020 v-profile-log-title-hover">{{ log.exerciseName }}</h4>
                      <div v-if="log.exercises && log.exercises.length > 0" class="v-profile-log-exercise-list">
                        <div
                          v-for="(exercise, exerciseIndex) in log.exercises"
                          :key="`${log.id}-${exerciseIndex}-${exercise.name}`"
                          class="v-workout-detail-box v-history-workout-detail-box"
                        >
                          <div class="v-history-workout-detail-inline">
                            <span class="v-workout-detail-name v-history-workout-detail-name">{{ exercise.name }}</span>
                            <span class="v-history-workout-detail-stats">
                              {{ formatExerciseSummary(exercise) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="sx-views-user-profile-profileview-022">
                    <span class="v-profile-log-time">{{ log.timeAgo }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="ux-views-user-profile-profileview-001">
            <div class="view-card-sm">
              <h3 class="sx-views-user-profile-profileview-024">업적</h3>
              <div class="sx-views-user-profile-profileview-025">
                <div v-for="ach in achievements" :key="ach.id" :class="achievementClass(ach.status)">
                  <span :class="ach.status === 'locked' ? 'v-achievement-locked-icon' : ''">{{ ach.icon }}</span>
                </div>
              </div>
            </div>

            <div v-if="isOwnProfile" class="view-card-sm">
              <div class="v-profile-side-card-head">
                <h3 class="sx-views-user-profile-profileview-024">예약 내역</h3>
                <RouterLink to="/reservationHistory" class="v-profile-view-all-link">전체 보기</RouterLink>
              </div>

              <div v-if="isLoadingReservationPreview" class="v-profile-reservation-preview v-profile-reservation-preview-loading">
                예약 내역을 불러오는 중입니다.
              </div>
              <div v-else-if="nearestReservation" class="v-profile-reservation-preview">
                <div class="v-profile-reservation-head">
                  <span class="v-profile-reservation-phase" :class="reservationPreviewPhaseClass(nearestReservation)">
                    {{ nearestReservation.phaseLabel }}
                  </span>
                  <span class="v-profile-reservation-relative">{{ nearestReservation.relativeLabel }}</span>
                </div>
                <h4 class="v-profile-membership-title">{{ nearestReservation.gymName }}</h4>
                <p class="v-profile-membership-dday">{{ nearestReservation.date }} {{ nearestReservation.time }}</p>
                <p v-if="nearestReservation.cancelReason" class="v-profile-reservation-note">
                  취소 사유: {{ nearestReservation.cancelReason }}
                </p>
              </div>
              <p v-else class="v-profile-log-empty">
                예약 내역이 없습니다.<br />
                원하는 시간대의 수업이나 슬롯을 예약해보세요.
              </p>
            </div>
          </div>
        </div>

        <footer class="v-page-footer">
          <div class="sx-views-user-profile-profileview-027">
            <span>© 2026 tantan</span>
            <RouterLink to="/legal/terms" class="v-footer-link">이용약관</RouterLink>
            <RouterLink to="/legal/privacy" class="v-footer-link">개인정보처리방침</RouterLink>
            <button
              v-if="isOwnProfile && !isGymOwner"
              type="button"
              class="v-footer-link v-footer-link-button"
              @click="handleProfileFooterAction"
            >
              {{ profileFooterActionLabel }}
            </button>
          </div>
        </footer>
      </div>
    </div>

    <div
      v-if="isFollowListModalOpen && !isGymOwner && !shouldMaskPrivateProfile"
      class="v-follow-modal-backdrop"
      @click.self="closeFollowListModal"
    >
      <div class="v-follow-modal">
        <div class="v-follow-modal-head">
          <div class="v-follow-modal-tabs">
            <button
              type="button"
              class="v-follow-modal-tab"
              :class="activeFollowListTab === 'followers' ? 'v-follow-modal-tab-active' : ''"
              @click="changeFollowListTab('followers')"
            >
              팔로워 {{ followerCountText }}
            </button>
            <button
              type="button"
              class="v-follow-modal-tab"
              :class="activeFollowListTab === 'followings' ? 'v-follow-modal-tab-active' : ''"
              @click="changeFollowListTab('followings')"
            >
              팔로잉 {{ followingCountText }}
            </button>
          </div>
          <button type="button" class="v-follow-modal-close" @click="closeFollowListModal">
            <X :size="20" />
          </button>
        </div>

        <div class="v-follow-modal-body">
          <p v-if="isFollowListLoading" class="v-follow-modal-empty">목록을 불러오는 중입니다...</p>
          <p v-else-if="followListError" class="v-follow-modal-empty v-follow-modal-error">{{ followListError }}</p>
          <p v-else-if="activeFollowList.length === 0" class="v-follow-modal-empty">표시할 사용자가 없습니다.</p>
          <div v-else class="v-follow-modal-list">
            <button
              v-for="item in activeFollowList"
              :key="item.userId"
              type="button"
              class="v-follow-modal-item"
              @click="moveToProfile(item.userId)"
            >
              <img :src="item.profileImageUrl" :alt="item.displayName" class="v-follow-modal-avatar" @error="handleUserAvatarError" />
              <div class="v-follow-modal-meta">
                <strong>{{ item.displayName }}</strong>
                <span>@{{ item.userName }}</span>
              </div>
              <span v-if="item.isFollowedByMe" class="v-follow-modal-chip">팔로잉</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen && !isGymOwner" class="sx-views-user-profile-profileview-028">
      <div class="sx-views-user-profile-profileview-029">
        <div class="sx-views-user-profile-profileview-030">
          <h2 class="v-modal-title">운동 기록하기</h2>
          <button class="sx-views-user-profile-profileview-031" @click="closeWorkoutModal"><X :size="24" /></button>
        </div>

        <div class="sx-views-user-profile-profileview-032">
          <div class="sx-views-user-profile-profileview-033 sx-views-user-profile-profileview-033-single">
            <div class="u-col-gap-2">
              <label class="v-form-label">운동 날짜 및 시간</label>
              <input
                v-model="workoutForm.dateTime"
                type="datetime-local"
                step="60"
                :max="workoutDateTimeMax"
                class="v-modal-line-input v-workout-date-time-field"
                @focus="syncWorkoutDateTimeMax"
                @click="syncWorkoutDateTimeMax"
              />
            </div>
          </div>

            <div class="u-col-gap-3">
              <div class="sx-views-user-profile-profilehistoryview-002">
              <label class="v-form-label">운동 세부 내역</label>
              <button class="sx-views-user-profile-profileview-037" @click="addExercise">
                <Plus :size="16" />
                운동 추가
              </button>
            </div>

            <div class="u-col-gap-3">
              <div v-for="(exercise, idx) in workoutForm.exercises" :key="idx" class="v-profile-exercise-item">
                <div class="v-profile-exercise-row">
                  <input v-model="exercise.name" type="text" placeholder="운동명" class="v-modal-line-input sx-views-user-profile-profileview-038 v-profile-exercise-name-input" />
                  <input
                    v-model="exercise.weight"
                    type="text"
                    inputmode="numeric"
                    placeholder="중량(kg)"
                    class="v-modal-line-input sx-views-user-profile-profileview-038 v-profile-exercise-number-input v-profile-exercise-weight-input"
                    @input="handleExerciseNumberInput(idx, 'weight', $event)"
                  />
                  <input
                    v-model="exercise.sets"
                    type="text"
                    inputmode="numeric"
                    placeholder="세트"
                    class="v-modal-line-input sx-views-user-profile-profileview-038 v-profile-exercise-number-input v-profile-exercise-sets-input"
                    @input="handleExerciseNumberInput(idx, 'sets', $event)"
                  />
                  <input
                    v-model="exercise.reps"
                    type="text"
                    inputmode="numeric"
                    placeholder="횟수"
                    class="v-modal-line-input sx-views-user-profile-profileview-038 v-profile-exercise-number-input v-profile-exercise-reps-input"
                    @input="handleExerciseNumberInput(idx, 'reps', $event)"
                  />
                  <button class="sx-views-user-profile-profileview-039 v-profile-exercise-delete-btn" @click="removeExercise(idx)">
                    <Trash2 :size="18" />
                  </button>
                </div>
                <p v-if="exerciseInputErrors[idx]" class="v-profile-exercise-error">숫자만 입력해주세요.</p>
              </div>
            </div>
          </div>

          <!-- <div class="sx-views-user-profile-profileview-041">
            <label class="v-form-label">오운완 인증샷</label>
            <div class="v-upload-dropzone">
              <div class="sx-views-user-profile-profileview-042">
                <Camera :size="20" class="v-icon-20-md24" />
              </div>
              <div class="sx-views-user-profile-profileview-043">
                <p class="v-upload-title">사진을 업로드하세요</p>
                <p class="v-upload-caption">PNG, JPG 최대 10MB</p>
              </div>
            </div>
          </div> -->
        </div>

        <div class="sx-views-user-profile-profileview-044">
          <button class="v-modal-cancel-btn" @click="closeWorkoutModal">취소</button>
          <button class="v-modal-save-btn" @click="createWorkout">저장하기</button>
        </div>
      </div>
    </div>

    <div
      v-if="isGymOwnerApplyModalOpen && isOwnProfile && !isGymOwner"
      class="v-owner-apply-modal-backdrop"
      @click.self="closeGymOwnerApplyModal"
    >
      <div class="v-owner-apply-modal">
        <div class="v-owner-apply-modal-head">
          <h2 class="v-modal-title">헬스장 관리자 신청</h2>
          <button
            type="button"
            class="sx-views-user-profile-profileview-031"
            :disabled="isApplyingGymOwner"
            @click="closeGymOwnerApplyModal"
          >
            <X :size="24" />
          </button>
        </div>

        <div class="v-owner-apply-modal-body">
          <p class="v-owner-apply-modal-desc">
            사업자 등록번호를 입력하면 사장님 권한 신청을 진행합니다.
          </p>
          <input
            v-model="gymOwnerRegistryNum"
            type="text"
            placeholder="사업자 등록번호 입력 (예: 123-45-67890)"
            class="v-history-search-input v-owner-apply-modal-input"
          />
          <p v-if="gymOwnerApplyMessage" class="v-profile-owner-apply-msg v-profile-owner-apply-msg-success">
            {{ gymOwnerApplyMessage }}
          </p>
          <p v-else-if="gymOwnerApplyError" class="v-profile-owner-apply-msg v-profile-owner-apply-msg-error">
            {{ gymOwnerApplyError }}
          </p>
        </div>

        <div class="v-owner-apply-modal-actions">
          <button
            type="button"
            class="v-modal-cancel-btn"
            :disabled="isApplyingGymOwner"
            @click="closeGymOwnerApplyModal"
          >
            취소
          </button>
          <button
            type="button"
            class="v-modal-save-btn"
            :disabled="isApplyingGymOwner"
            @click="applyForGymOwner"
          >
            {{ isApplyingGymOwner ? '신청 중...' : '신청하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { Plus, History, Trash2, X, CheckCircle2 } from 'lucide-vue-next';
import { chatApi, followApi, gymApi, gymFavoriteApi, userApi, workoutApi, reservationApi } from '@/services/apis';
import { useSession } from '@/composables/useSession';
import { normalizeRole } from '@/services/token';
import { formatTimeAgo } from '@/utils/time';
import { extractList, extractPayload } from '@/utils/api';
import { normalizeReservationRecord, pickNearestReservation, sortReservationRecords } from '@/utils/reservationHistory';
import { resolveUserAvatar, handleUserAvatarError } from '@/utils/userAvatar';
import { buildWorkoutTags, buildWorkoutTitle, extractWorkoutExercises } from '@/utils/workoutDisplay';

const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
const heatmapDayLabels = ['', '월', '', '수', '', '금', ''];
const DEFAULT_HEATMAP_CELL_SIZE = 14;
const DEFAULT_HEATMAP_MONTH_OFFSET = 18;
const selectedHeatmapYear = ref(new Date().getFullYear());
const earliestHeatmapYear = ref(new Date().getFullYear());
const heatmapContributionTotal = ref(0);
const heatmapMonthLabelByWeek = ref([]);
const heatmapWeekCount = computed(() => Math.max(1, Number(heatmapData.value?.length || heatmapMonthLabelByWeek.value?.length || 0)));
const heatmapActivityMainRef = ref(null);
const heatmapCellSize = ref(DEFAULT_HEATMAP_CELL_SIZE);
const heatmapMonthOffset = ref(DEFAULT_HEATMAP_MONTH_OFFSET);
const heatmapLayoutStyle = computed(() => ({
  '--heatmap-cell-size': `${heatmapCellSize.value}px`,
  '--heatmap-month-offset': `${heatmapMonthOffset.value}px`,
}));
const heatmapTooltip = ref({
  visible: false,
  text: '',
  left: 0,
  top: 0,
});
const heatmapWorkoutDayTotal = computed(() => (
  (Array.isArray(heatmapData.value) ? heatmapData.value : []).reduce((total, week) => (
    total + (Array.isArray(week) ? week.filter((value) => Number(value || 0) > 0).length : 0)
  ), 0)
));
const heatmapCurrentStreak = computed(() => {
  const activeDates = [];
  for (let weekIndex = 0; weekIndex < heatmapData.value.length; weekIndex += 1) {
    const weekValues = Array.isArray(heatmapData.value[weekIndex]) ? heatmapData.value[weekIndex] : [];
    for (let dayIndex = 0; dayIndex < weekValues.length; dayIndex += 1) {
      const value = Number(weekValues[dayIndex] || 0);
      if (value <= 0) continue;
      const date = getHeatmapCellDate(weekIndex, dayIndex);
      if (date) activeDates.push(date);
    }
  }

  if (activeDates.length === 0) return 0;

  const sorted = [...new Set(activeDates)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  let streak = 1;
  for (let index = sorted.length - 1; index > 0; index -= 1) {
    const current = new Date(`${sorted[index]}T00:00:00`);
    const previous = new Date(`${sorted[index - 1]}T00:00:00`);
    const dayDiff = (current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000);
    if (dayDiff === 1) {
      streak += 1;
      continue;
    }
    break;
  }
  return streak;
});
const heatmapYearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = Math.max(2000, Number(earliestHeatmapYear.value || currentYear));
  const yearCount = Math.max(1, currentYear - startYear + 1);
  const years = Array.from({ length: yearCount }, (_, index) => currentYear - index);
  if (!years.includes(selectedHeatmapYear.value)) {
    years.push(selectedHeatmapYear.value);
    years.sort((a, b) => b - a);
  }
  return years;
});
const isHeatmapYearDropdownOpen = ref(false);
const heatmapYearDropdownRef = ref(null);
const exerciseInputErrors = ref([]);
const achievements = [
  { id: 1, icon: '🏆', status: 'unlocked' },
  { id: 2, icon: '🔒', status: 'locked' },
  { id: 3, icon: '🔒', status: 'locked' },
];

const isModalOpen = ref(false);
const profile = ref({});
const heatmapData = ref([]);
const heatmapDateData = ref([]);
const logs = ref([]);
const reservationPreviewList = ref([]);
const isLoadingReservationPreview = ref(false);
const route = useRoute();
const router = useRouter();
const { sessionProfile, primeSessionFromToken, syncSessionFromServer } = useSession();
const isCreatingChat = ref(false);
const isFollowBusy = ref(false);
const isFavoriteBusy = ref(false);
const isFollowing = ref(false);
const isFavoriteGym = ref(false);
const gymOwnerRegistryNum = ref('');
const isApplyingGymOwner = ref(false);
const gymOwnerApplyMessage = ref('');
const gymOwnerApplyError = ref('');
const isGymOwnerApplyModalOpen = ref(false);
const followCounts = ref({ followerCount: 0, followingCount: 0 });
const isFollowListModalOpen = ref(false);
const activeFollowListTab = ref('followers');
const isFollowListLoading = ref(false);
const followListError = ref('');
const followers = ref([]);
const followings = ref([]);
const previewRole = computed(() => normalizeRole(route.query.previewRole));
const routeTargetUserId = computed(() => {
  const raw = String(route.query.userId || '').trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});
const routeTargetGymId = computed(() => {
  const raw = String(route.query.gymId || '').trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});
const profileWorkoutHistoryLink = computed(() => ({
  path: '/workoutHistory',
  query: routeTargetUserId.value ? { userId: String(routeTargetUserId.value) } : undefined,
}));
const viewedRole = computed(() => (
  normalizeRole(profile.value?.role)
  || previewRole.value
  || normalizeRole(sessionProfile.value?.role)
  || 'USER'
));
const isAdminProfile = computed(() => viewedRole.value === 'ADMIN');
const isGymOwner = computed(() => viewedRole.value === 'GYM_OWNER');
const viewedUserId = computed(() => {
  const fromProfile = Number(profile.value?.id ?? profile.value?.userId ?? 0);
  if (Number.isFinite(fromProfile) && fromProfile > 0) return fromProfile;
  return routeTargetUserId.value;
});
const displayProfileName = computed(() => (
  profile.value?.displayName
  || profile.value?.nickName
  || profile.value?.nickname
  || profile.value?.userName
  || '사용자'
));
const displayProfileBio = computed(() => (
  String(profile.value?.bio ?? '').trim()
  || '등록된 소개가 없습니다.'
));
const displayProfileImage = computed(() => (
  resolveUserAvatar(
    profile.value?.profileThumbnailUrl
    || profile.value?.thumbnailUrl
    || profile.value?.profileImageUrl
    || profile.value?.profileImage,
  )
));
const viewedGymId = computed(() => {
  const fromProfile = Number(profile.value?.gymId ?? profile.value?.homeGymId ?? 0);
  if (Number.isFinite(fromProfile) && fromProfile > 0) return fromProfile;
  if (Number.isFinite(routeTargetGymId.value) && routeTargetGymId.value > 0) return routeTargetGymId.value;
  const fromGymForm = Number(gymOwnerForm.value?.id ?? gymOwnerForm.value?.gymId ?? 0);
  if (Number.isFinite(fromGymForm) && fromGymForm > 0) return fromGymForm;
  return null;
});
const currentUserId = computed(() => {
  const raw = Number(sessionProfile.value?.id ?? 0);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
});
const isOwnProfile = computed(() => {
  if (typeof profile.value?.isMe === 'boolean') return profile.value.isMe;
  if (!viewedUserId.value || !currentUserId.value) return true;
  return Number(viewedUserId.value) === Number(currentUserId.value);
});
const profileFooterActionLabel = computed(() => (
  isOwnProfile.value && isAdminProfile.value ? '관리자 페이지 가기' : '운동업체 등록하기'
));
const isPrivateProfile = computed(() => Boolean(profile.value?.privateProfile));
const shouldMaskPrivateProfile = computed(() => !isOwnProfile.value && isPrivateProfile.value);
const normalizedProfileUserId = computed(() => Number(viewedUserId.value || currentUserId.value || 0));
const canStartChat = computed(() => {
  if (shouldMaskPrivateProfile.value) return false;
  if (isOwnProfile.value) return false;
  if (typeof profile.value?.canChat === 'boolean') return profile.value.canChat;
  return true;
});
const activeFollowList = computed(() => (
  activeFollowListTab.value === 'followers' ? followers.value : followings.value
));
const followerCountText = computed(() => formatFollowCount(followCounts.value.followerCount));
const followingCountText = computed(() => formatFollowCount(followCounts.value.followingCount));
const gymOwnerEditLink = computed(() => (
  (previewRole.value || (isOwnProfile.value && isGymOwner.value ? 'GYM_OWNER' : null))
    ? { path: '/profile/edit', query: { previewRole: previewRole.value || 'GYM_OWNER' } }
    : { path: '/profile/edit' }
));
const nearestReservation = computed(() => pickNearestReservation(reservationPreviewList.value));

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const dayLabelMap = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

const reservationPreviewPhaseClass = (reservation) => ({
  'v-profile-reservation-phase-upcoming': reservation?.phase === 'upcoming',
  'v-profile-reservation-phase-past': reservation?.phase === 'past',
  'v-profile-reservation-phase-cancelled': reservation?.phase === 'cancelled',
});

const defaultHours = () => DAY_ORDER.map((day) => ({
  dayOfWeek: day,
  openTime: '06:00',
  closeTime: '23:00',
  isClosed: false,
}));

const gymOwnerForm = ref({
  id: null,
  userId: null,
  name: '',
  address: '',
  description: '',
  categoryId: null,
  categoryName: '',
  tel: '',
});
const gymOwnerHours = ref(defaultHours());
const gymOwnerAmenitiesInput = ref('');
const gymOwnerProducts = ref([{ productName: '', price: 0 }]);
const gymOwnerExceptions = ref([]);
const gymOwnerImages = ref([]);
const gymOwnerPendingImages = ref([]);
const gymOwnerSelectedImageNames = ref([]);
const gymOwnerSlots = ref([]);
const selectedSlotDate = ref(
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
);
const gymOwnerExceptionForm = ref({
  specificDate: '',
  openTime: '09:00',
  closeTime: '18:00',
  isClosed: false,
  description: '',
});
const isSavingGymProfile = ref(false);
const isSavingGymHours = ref(false);
const isSavingGymAmenities = ref(false);
const isSavingGymProducts = ref(false);
const isCreatingGymException = ref(false);
const isUploadingGymImages = ref(false);
const isDeletingGymImage = ref(false);
const gymOwnerMessage = ref('');
const gymOwnerError = ref('');
const gymOwnerCategoryName = computed(() => {
  const categoryName = String(
    gymOwnerForm.value.categoryName
    || gymOwnerForm.value.category
    || '',
  ).trim();
  return categoryName || '-';
});
const amenityCount = computed(() => gymOwnerAmenitiesInput.value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean).length);

const loadGymSlots = async () => {
  if (!viewedGymId.value) return;
  try {
    const response = await reservationApi.getSlots(viewedGymId.value, selectedSlotDate.value);
    const payload = response?.data?.data || response?.data?.result || response?.data || [];
    gymOwnerSlots.value = Array.isArray(payload) ? payload : [];
  } catch (error) {
    gymOwnerSlots.value = [];
  }
};

const toDateTimeInputValue = (input = new Date()) => {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const createEmptyExercise = () => ({
  name: '',
  weight: '',
  sets: '',
  reps: '',
});

const createEmptyWorkoutForm = () => ({
  dateTime: toDateTimeInputValue(new Date()),
  exercises: [createEmptyExercise()],
});

const workoutDateTimeMax = ref(toDateTimeInputValue(new Date()));

const workoutForm = ref({
  ...createEmptyWorkoutForm(),
});

const syncWorkoutDateTimeMax = () => {
  workoutDateTimeMax.value = toDateTimeInputValue(new Date());
};

const openWorkoutModal = () => {
  syncWorkoutDateTimeMax();
  workoutForm.value = createEmptyWorkoutForm();
  exerciseInputErrors.value = workoutForm.value.exercises.map(() => false);
  isModalOpen.value = true;
};

const closeWorkoutModal = () => {
  exerciseInputErrors.value = [];
  isModalOpen.value = false;
};

const formatFollowCount = (value) => {
  const count = Number(value || 0);
  if (!Number.isFinite(count) || count <= 0) return '0';
  if (count >= 1000) {
    const compact = (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1);
    return `${compact}천`;
  }
  return count.toLocaleString();
};

const formatWorkoutMetricValue = (value, unit = '') => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return '-';
  return `${normalized.toLocaleString()}${unit}`;
};

const formatExerciseSummary = (exercise = {}) => {
  const parts = [];
  if (exercise.hasWeight && exercise.weight !== null) {
    parts.push(formatWorkoutMetricValue(exercise.weight, 'kg'));
  }
  if (exercise.hasSets && exercise.sets !== null) {
    parts.push(`${formatWorkoutMetricValue(exercise.sets)}세트`);
  }
  if (exercise.hasReps && exercise.reps !== null) {
    parts.push(`${formatWorkoutMetricValue(exercise.reps)}회`);
  }
  return parts.length > 0 ? parts.join(', ') : '-';
};

const toFollowUserList = (payload) => {
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload?.list)
        ? payload.list
        : [];

  return rawList
    .map((item) => {
      const userId = Number(item?.userId ?? item?.id ?? 0);
      if (!Number.isFinite(userId) || userId <= 0) return null;
      return {
        userId,
        userName: String(item?.userName || item?.nickname || '').trim() || `user${userId}`,
        displayName: String(item?.displayName || item?.nickname || item?.userName || '').trim() || `사용자 ${userId}`,
        profileImageUrl: resolveUserAvatar(item?.profileThumbnailUrl || item?.profileImageUrl || item?.profileImage),
        isFollowedByMe: Boolean(item?.isFollowedByMe),
      };
    })
    .filter(Boolean);
};

const resetFollowModalState = () => {
  isFollowListLoading.value = false;
  followListError.value = '';
  isFollowListModalOpen.value = false;
};

const loadFollowCounts = async () => {
  const userId = Number(normalizedProfileUserId.value || 0);
  if (!userId) {
    followCounts.value = { followerCount: 0, followingCount: 0 };
    return;
  }

  try {
    const response = await followApi.count(userId);
    const payload = response?.data?.data || response?.data?.result || response?.data || {};
    followCounts.value = {
      followerCount: Number(payload?.followerCount || 0),
      followingCount: Number(payload?.followingCount || 0),
    };
  } catch (error) {
    followCounts.value = { followerCount: 0, followingCount: 0 };
  }
};

const loadFollowList = async (tab) => {
  const userId = Number(normalizedProfileUserId.value || 0);
  if (!userId) {
    followListError.value = '사용자 정보를 확인할 수 없습니다.';
    followers.value = [];
    followings.value = [];
    return;
  }

  isFollowListLoading.value = true;
  followListError.value = '';
  try {
    const request = tab === 'followers'
      ? followApi.followers(userId, { offset: 0, limit: 100 })
      : followApi.followings(userId, { offset: 0, limit: 100 });
    const response = await request;
    const payload = response?.data?.data || response?.data?.result || response?.data || [];
    const list = toFollowUserList(payload);

    if (tab === 'followers') {
      followers.value = list;
    } else {
      followings.value = list;
    }
  } catch (error) {
    followListError.value = '팔로우 목록을 불러오지 못했습니다.';
  } finally {
    isFollowListLoading.value = false;
  }
};

const openFollowListModal = async (tab) => {
  if (isGymOwner.value || shouldMaskPrivateProfile.value) return;
  activeFollowListTab.value = tab === 'followings' ? 'followings' : 'followers';
  isFollowListModalOpen.value = true;
  await loadFollowList(activeFollowListTab.value);
};

const changeFollowListTab = async (tab) => {
  const normalizedTab = tab === 'followings' ? 'followings' : 'followers';
  if (activeFollowListTab.value === normalizedTab) return;
  activeFollowListTab.value = normalizedTab;
  await loadFollowList(normalizedTab);
};

const closeFollowListModal = () => {
  resetFollowModalState();
};

const moveToProfile = (userId) => {
  const nextUserId = Number(userId || 0);
  if (!nextUserId) return;
  closeFollowListModal();

  if (currentUserId.value && nextUserId === Number(currentUserId.value)) {
    router.push({ path: '/profile' });
    return;
  }

  router.push({
    path: '/profile',
    query: { userId: String(nextUserId) },
  });
};

const normalizeWorkout = (item, index) => {
  const exercises = extractWorkoutExercises(item);
  const hasExerciseValues = exercises.some((exercise) => exercise.hasWeight || exercise.hasSets || exercise.hasReps);
  const totalWeight = exercises.reduce((sum, exercise) => sum + Number(exercise?.weight ?? 0), 0);
  const totalSets = exercises.reduce((sum, exercise) => sum + Number(exercise?.sets ?? 0), 0);
  const totalReps = exercises.reduce((sum, exercise) => sum + Number(exercise?.reps ?? 0), 0);
  const fallbackWeight = Number(item?.totalVolume ?? item?.totalWeight ?? item?.weight ?? 0);
  const fallbackSets = Number(item?.totalSets ?? item?.setCount ?? item?.sets ?? 0);
  const fallbackReps = Number(item?.totalReps ?? item?.rep ?? item?.reps ?? item?.repCount ?? 0);
  const fallbackTitle = item.workoutCondition || item.title || item.name || `운동 ${index + 1}`;

  return {
    ...item,
    id: item.workoutId ?? item.id ?? `workout-${index + 1}`,
    exerciseName: buildWorkoutTitle(exercises, fallbackTitle),
    exercises,
    tags: buildWorkoutTags(exercises),
    timeAgo: item.timeAgo || formatTimeAgo(item.workoutDate || item.createdTime || item.createdAt),
    stats: {
      중량: `${Number(hasExerciseValues ? totalWeight : fallbackWeight || 0).toLocaleString()}kg`,
      세트: Number(hasExerciseValues ? totalSets : fallbackSets || 0),
      횟수: Number(hasExerciseValues ? totalReps : fallbackReps || 0),
    },
  };
};

const heatmapColorClass = (value) => {
  if (value === 0) return 'v-heatmap-level-0';
  if (value === 1) return 'v-heatmap-level-1';
  if (value === 2) return 'v-heatmap-level-2';
  if (value === 3) return 'v-heatmap-level-3';
  return 'v-heatmap-level-4';
};

const achievementClass = (status) => (
  status === 'unlocked'
    ? 'v-profile-achievement-box v-profile-achievement-unlocked'
    : 'v-profile-achievement-box v-profile-achievement-locked'
);

const addExercise = () => {
  workoutForm.value.exercises.push(createEmptyExercise());
  exerciseInputErrors.value.push(false);
};

const removeExercise = (index) => {
  workoutForm.value.exercises = workoutForm.value.exercises.filter((_, idx) => idx !== index);
  exerciseInputErrors.value = exerciseInputErrors.value.filter((_, idx) => idx !== index);
};

const handleExerciseNumberInput = (index, field, event) => {
  const rawValue = String(event?.target?.value ?? '');
  const digitsOnly = rawValue.replace(/\D/g, '');
  exerciseInputErrors.value[index] = rawValue !== digitsOnly;
  workoutForm.value.exercises[index][field] = digitsOnly;
  if (event?.target) event.target.value = digitsOnly;
};

const toHHmm = (value, fallback = '00:00') => {
  if (!value) return fallback;
  const str = String(value);
  // ISO 형식 (2026-03-17T14:00:00) 또는 날짜 포함 문자열에서 시간 추출
  const timeMatch = str.match(/(\d{2}:\d{2})/);
  if (timeMatch) return timeMatch[1];
  return str.slice(0, 5);
};

const formatGymOwnerTime = (value) => toHHmm(value, '--:--');

const toHHmmss = (value, fallback = '00:00:00') => {
  if (!value) return fallback;
  const sliced = String(value).slice(0, 8);
  if (sliced.length === 5) return `${sliced}:00`;
  if (sliced.length === 8) return sliced;
  return fallback;
};

const applyGymOwnerData = (payload = {}) => {
  gymOwnerForm.value.id = Number(payload.id || payload.gymId || 0) || null;
  gymOwnerForm.value.userId = Number(payload.ownerId || payload.userId || 0) || null;
  gymOwnerForm.value.name = payload.name || '';
  gymOwnerForm.value.address = payload.address || '';
  gymOwnerForm.value.description = payload.description || '';
  const categoryId = Number(payload.categoryId ?? payload.category?.id ?? 0);
  gymOwnerForm.value.categoryId = Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null;
  gymOwnerForm.value.categoryName = String(
    payload.categoryName
    || payload.category?.name
    || (typeof payload.category === 'string' ? payload.category : '')
    || '',
  ).trim();
  gymOwnerForm.value.tel = payload.tel || payload.phone || '';

  const hours = payload.hours || payload.businessHours || payload.gymHours || [];
  if (Array.isArray(hours) && hours.length > 0) {
    const merged = defaultHours();
    hours.forEach((item) => {
      const idx = merged.findIndex((base) => base.dayOfWeek === String(item.dayOfWeek || '').toUpperCase());
      if (idx < 0) return;
      merged[idx] = {
        ...merged[idx],
        openTime: toHHmm(item.openTime, merged[idx].openTime),
        closeTime: toHHmm(item.closeTime, merged[idx].closeTime),
        isClosed: Boolean(item.isClosed ?? item.closed),
      };
    });
    gymOwnerHours.value = merged;
  }

  const amenities = payload.amenities || payload.amenityCodes || [];
  gymOwnerAmenitiesInput.value = Array.isArray(amenities) && amenities.length > 0
    ? amenities.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return item.name || item.amenityName || item.title || JSON.stringify(item);
      }
      return String(item);
    }).join(', ')
    : '';

  const products = payload.products || [];
  gymOwnerProducts.value = Array.isArray(products) && products.length > 0
    ? products.map((item) => ({
      productName: item.productName || item.name || '',
      price: Number(item.price || 0),
    }))
    : [{ productName: '', price: 0 }];

  const rawImages = payload.images || payload.imageList || payload.gymImages || [];
  gymOwnerImages.value = Array.isArray(rawImages)
    ? rawImages
      .map((item, index) => {
        const id = item?.imageId ?? item?.id ?? null;
        const url = item?.imageUrl || item?.url || item?.path || item?.src || '';
        if (!url) return null;
        return {
          id,
          url,
          key: `${id ?? 'no-id'}-${index}`,
        };
      })
      .filter(Boolean)
    : [];
};

const deleteWorkout = async (id) => {
  if (!isOwnProfile.value) return;
  if (!window.confirm('이 운동 기록을 삭제하시겠습니까?')) return;
  try {
    await workoutApi.delete(id);
  } catch (error) {
    console.error('Delete workout API failed, removing locally:', error);
  } finally {
    logs.value = logs.value.filter((item) => item.id !== id);
  }
};

const saveGymOwnerProfile = async () => {
  isSavingGymProfile.value = true;
  gymOwnerMessage.value = '';
  gymOwnerError.value = '';
  try {
    await gymApi.updateProfile({
      name: gymOwnerForm.value.name,
      address: gymOwnerForm.value.address,
      description: gymOwnerForm.value.description,
      categoryId: Number(gymOwnerForm.value.categoryId || 1),
      tel: gymOwnerForm.value.tel,
    });
    gymOwnerMessage.value = '짐 기본 정보가 저장되었습니다.';
  } catch (error) {
    gymOwnerError.value = '짐 기본 정보 저장에 실패했습니다.';
  } finally {
    isSavingGymProfile.value = false;
  }
};

const saveGymOwnerHours = async () => {
  isSavingGymHours.value = true;
  gymOwnerMessage.value = '';
  gymOwnerError.value = '';
  try {
    await gymApi.replaceHours(gymOwnerHours.value.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      openTime: toHHmmss(item.openTime, '06:00:00'),
      closeTime: toHHmmss(item.closeTime, '23:00:00'),
      closed: Boolean(item.isClosed),
    })));
    gymOwnerMessage.value = '영업 시간이 저장되었습니다.';
  } catch (error) {
    gymOwnerError.value = '영업 시간 저장에 실패했습니다.';
  } finally {
    isSavingGymHours.value = false;
  }
};

const saveGymOwnerAmenities = async () => {
  isSavingGymAmenities.value = true;
  gymOwnerMessage.value = '';
  gymOwnerError.value = '';
  try {
    const payload = gymOwnerAmenitiesInput.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    await gymApi.replaceAmenities(payload);
    gymOwnerMessage.value = '편의시설이 저장되었습니다.';
  } catch (error) {
    gymOwnerError.value = '편의시설 저장에 실패했습니다.';
  } finally {
    isSavingGymAmenities.value = false;
  }
};

const handleGymOwnerImageChange = (event) => {
  const files = Array.from(event?.target?.files || []);
  gymOwnerPendingImages.value = files;
  gymOwnerSelectedImageNames.value = files.map((file) => file.name);
};

const uploadGymOwnerImages = async () => {
  if (gymOwnerPendingImages.value.length === 0) return;

  isUploadingGymImages.value = true;
  gymOwnerMessage.value = '';
  gymOwnerError.value = '';
  try {
    await gymApi.addImages(gymOwnerPendingImages.value);
    gymOwnerPendingImages.value = [];
    gymOwnerSelectedImageNames.value = [];
    await loadProfileData();
    gymOwnerMessage.value = '짐 이미지가 업로드되었습니다.';
  } catch (error) {
    gymOwnerError.value = '짐 이미지 업로드에 실패했습니다.';
  } finally {
    isUploadingGymImages.value = false;
  }
};

const deleteGymOwnerImage = async (image) => {
  if (!image?.id) return;
  if (!window.confirm('해당 이미지를 삭제할까요?')) return;

  isDeletingGymImage.value = true;
  gymOwnerMessage.value = '';
  gymOwnerError.value = '';
  try {
    await gymApi.deleteImage(image.id);
    await loadProfileData();
    gymOwnerMessage.value = '짐 이미지가 삭제되었습니다.';
  } catch (error) {
    gymOwnerError.value = '짐 이미지 삭제에 실패했습니다.';
  } finally {
    isDeletingGymImage.value = false;
  }
};

const addGymOwnerProduct = () => {
  gymOwnerProducts.value.push({ productName: '', price: 0 });
};

const removeGymOwnerProduct = (index) => {
  gymOwnerProducts.value = gymOwnerProducts.value.filter((_, idx) => idx !== index);
};

const saveGymOwnerProducts = async () => {
  isSavingGymProducts.value = true;
  gymOwnerMessage.value = '';
  gymOwnerError.value = '';
  try {
    const payload = gymOwnerProducts.value
      .filter((item) => item.productName)
      .map((item) => ({
        productName: item.productName,
        price: Number(item.price || 0),
      }));
    await gymApi.replaceProducts(payload);
    gymOwnerMessage.value = '상품 정보가 저장되었습니다.';
  } catch (error) {
    gymOwnerError.value = '상품 저장에 실패했습니다.';
  } finally {
    isSavingGymProducts.value = false;
  }
};

const loadGymOwnerExceptions = async () => {
  try {
    const response = await gymApi.listException();
    const payload = response?.data?.data || response?.data?.result || response?.data || [];
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.list)
          ? payload.list
          : [];
    gymOwnerExceptions.value = list;
  } catch (error) {
    gymOwnerExceptions.value = [];
  }
};

const createGymOwnerException = async () => {
  if (!gymOwnerExceptionForm.value.specificDate) {
    gymOwnerError.value = '예외 날짜를 선택해주세요.';
    return;
  }

  isCreatingGymException.value = true;
  gymOwnerMessage.value = '';
  gymOwnerError.value = '';

  try {
    await gymApi.createException({
      specificDate: gymOwnerExceptionForm.value.specificDate,
      openTime: gymOwnerExceptionForm.value.isClosed ? null : toHHmmss(gymOwnerExceptionForm.value.openTime, '09:00:00'),
      closeTime: gymOwnerExceptionForm.value.isClosed ? null : toHHmmss(gymOwnerExceptionForm.value.closeTime, '18:00:00'),
      closed: gymOwnerExceptionForm.value.isClosed,
      description: gymOwnerExceptionForm.value.description || null,
    });
    gymOwnerExceptionForm.value.specificDate = '';
    gymOwnerExceptionForm.value.description = '';
    await loadGymOwnerExceptions();
    gymOwnerMessage.value = '예외 운영시간이 추가되었습니다.';
  } catch (error) {
    gymOwnerError.value = '예외 운영시간 추가에 실패했습니다.';
  } finally {
    isCreatingGymException.value = false;
  }
};

const deleteGymOwnerException = async (id) => {
  if (!window.confirm('해당 예외 시간을 삭제할까요?')) return;
  try {
    await gymApi.deleteException(id);
    await loadGymOwnerExceptions();
  } catch (error) {
    gymOwnerError.value = '예외 운영시간 삭제에 실패했습니다.';
  }
};

const loadProfileData = async () => {
  try {
    primeSessionFromToken();
    try {
      await syncSessionFromServer();
    } catch (error) {
      // preview mode can continue with local state
    }

    const userResponse = await userApi.myInfo(routeTargetUserId.value ? { userId: routeTargetUserId.value } : undefined);
    profile.value = userResponse?.data?.data || userResponse?.data?.result || userResponse?.data || {};
    followers.value = [];
    followings.value = [];
    resetFollowModalState();

    if (!isGymOwner.value && !shouldMaskPrivateProfile.value) {
      await loadFollowCounts();
    } else {
      followCounts.value = { followerCount: 0, followingCount: 0 };
    }

    if (!isGymOwner.value && !shouldMaskPrivateProfile.value) {
      try {
        const requestedUserId = Number(normalizedProfileUserId.value || 0) || null;
        const workoutResponse = await workoutApi.list({
          page: 0,
          size: 1,
          sort: 'workoutDate,desc',
          ...(requestedUserId ? { userId: requestedUserId } : {}),
        });
        const payload = workoutResponse?.data?.data || workoutResponse?.data?.result || workoutResponse?.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
            ? payload.content
            : Array.isArray(payload?.list)
              ? payload.list
              : [];
        logs.value = list.slice(0, 1).map(normalizeWorkout);
      } catch (error) {
        logs.value = [];
      }
    } else {
      logs.value = [];
    }

    if (isOwnProfile.value && !isGymOwner.value && !shouldMaskPrivateProfile.value) {
      isLoadingReservationPreview.value = true;
      try {
        const reservationResponse = await reservationApi.listMine();
        const reservationPayload = extractPayload(reservationResponse, []);
        const reservationList = extractList(reservationPayload);
        const now = Date.now();
        reservationPreviewList.value = sortReservationRecords(
          reservationList.map((item, index) => normalizeReservationRecord(item, index, now)),
          now,
        );
      } catch (error) {
        reservationPreviewList.value = [];
      } finally {
        isLoadingReservationPreview.value = false;
      }
    } else {
      reservationPreviewList.value = [];
      isLoadingReservationPreview.value = false;
    }

    let gymPayload = null;
    if (isGymOwner.value) {
      if (isOwnProfile.value) {
        const myGymResponse = await gymApi.myGym();
        gymPayload = myGymResponse?.data?.data || myGymResponse?.data?.result || myGymResponse?.data || null;
      } else if (viewedGymId.value) {
        const gymDetailResponse = await gymApi.detail(viewedGymId.value);
        gymPayload = gymDetailResponse?.data?.data || gymDetailResponse?.data?.result || gymDetailResponse?.data || null;
      }
    }

    if (gymPayload) {
      if (gymPayload?.name) {
        workoutForm.value.place = gymPayload.name;
      }
      applyGymOwnerData(gymPayload);
      await loadGymSlots();
      if (isOwnProfile.value && isGymOwner.value) {
        await loadGymOwnerExceptions();
      }
    }

    isFollowing.value = shouldMaskPrivateProfile.value ? false : Boolean(profile.value?.isFollowing);
    if (!isOwnProfile.value && isGymOwner.value && viewedGymId.value) {
      try {
        const checkResponse = await gymFavoriteApi.check(viewedGymId.value);
        const checkPayload = checkResponse?.data?.data ?? checkResponse?.data?.result ?? checkResponse?.data;
        // 객체 자체가 아닌 실제 불린 필드값을 확인하도록 수정
        isFavoriteGym.value = checkPayload === true || checkPayload?.isFavorite === true || checkPayload?.favorite === true;
      } catch (error) {
        isFavoriteGym.value = false;
      }
    } else {
      isFavoriteGym.value = false;
    }

    earliestHeatmapYear.value = await resolveEarliestWorkoutYear();
    if (!heatmapYearOptions.value.includes(selectedHeatmapYear.value)) {
      selectedHeatmapYear.value = heatmapYearOptions.value[0] || new Date().getFullYear();
    }

    if (shouldMaskPrivateProfile.value) {
      applyHeatmap(createEmptyYearlyHeatmap(selectedHeatmapYear.value));
    } else {
      await loadHeatmapData();
    }
  } catch (error) {
    console.error('Failed to load profile data:', error);
  }
};

const startChatWithUser = async () => {
  const otherUserId = Number(viewedUserId.value || (isGymOwner.value ? gymOwnerForm.value.userId : 0) || 0);
  if (!otherUserId || isOwnProfile.value) return;
  isCreatingChat.value = true;
  try {
    await chatApi.createRoom({ otherUserId });
    router.push('/chat');
  } catch (error) {
    // keep silent fail and let user retry
  } finally {
    isCreatingChat.value = false;
  }
};

const toggleFollow = async () => {
  const otherUserId = Number(viewedUserId.value || 0);
  if (!otherUserId || isOwnProfile.value) return;
  isFollowBusy.value = true;
  try {
    if (isFollowing.value) {
      await followApi.unfollow(otherUserId);
      isFollowing.value = false;
      followCounts.value = {
        ...followCounts.value,
        followerCount: Math.max(0, Number(followCounts.value.followerCount || 0) - 1),
      };
    } else {
      await followApi.follow(otherUserId);
      isFollowing.value = true;
      followCounts.value = {
        ...followCounts.value,
        followerCount: Number(followCounts.value.followerCount || 0) + 1,
      };
    }
  } catch (error) {
    // no-op
  } finally {
    isFollowBusy.value = false;
  }
};

const toggleGymFavorite = async () => {
  const gymId = Number(viewedGymId.value || 0);
  if (!gymId || isOwnProfile.value) return;
  isFavoriteBusy.value = true;
  try {
    if (isFavoriteGym.value) {
      await gymFavoriteApi.remove(gymId);
      isFavoriteGym.value = false;
    } else {
      await gymFavoriteApi.add(gymId);
      isFavoriteGym.value = true;
    }
  } catch (error) {
    // 에러 발생 시 상태를 서버와 맞추기 위해 현재 상태를 반전시키거나 알림을 줄 수 있습니다.
    // 여기서는 실패 메시지만 출력하고 상태는 유지합니다.
    console.error('즐겨찾기 처리 실패:', error);
  } finally {
    isFavoriteBusy.value = false;
  }
};

const openGymOwnerApplyModal = () => {
  gymOwnerApplyMessage.value = '';
  gymOwnerApplyError.value = '';
  isGymOwnerApplyModalOpen.value = true;
};

const handleProfileFooterAction = () => {
  if (isOwnProfile.value && isAdminProfile.value) {
    router.push('/admin');
    return;
  }
  openGymOwnerApplyModal();
};

const closeGymOwnerApplyModal = () => {
  if (isApplyingGymOwner.value) return;
  isGymOwnerApplyModalOpen.value = false;
  gymOwnerApplyError.value = '';
  gymOwnerApplyMessage.value = '';
};

const applyForGymOwner = async () => {
  const registryNum = String(gymOwnerRegistryNum.value || '').trim();
  if (!registryNum) {
    gymOwnerApplyError.value = '사업자 등록번호를 입력해주세요.';
    gymOwnerApplyMessage.value = '';
    return;
  }

  isApplyingGymOwner.value = true;
  gymOwnerApplyError.value = '';
  gymOwnerApplyMessage.value = '';
  try {
    await gymApi.apply(registryNum);
    gymOwnerApplyMessage.value = '헬스장 관리자 신청이 완료되었습니다.';
    gymOwnerRegistryNum.value = '';
    isGymOwnerApplyModalOpen.value = false;
    sessionProfile.value = {
      ...(sessionProfile.value || {}),
      role: 'GYM_OWNER',
      status: sessionProfile.value?.status || 'ACTIVE',
    };
    profile.value = {
      ...(profile.value || {}),
      role: 'GYM_OWNER',
      isMe: true,
    };
    await syncSessionFromServer({ force: true });
    await loadProfileData();
  } catch (error) {
    const message = String(
      error?.response?.data?.message
      || error?.response?.data?.error
      || error?.response?.data?.result
      || '',
    ).trim();
    gymOwnerApplyError.value = message || '사업자 조회불가: 국세청에 등록되지 않은 사업자등록번호입니다.';
  } finally {
    isApplyingGymOwner.value = false;
  }
};

const toDateParam = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createYearlyHeatmapGrid = (list, targetYear) => {
  const firstDay = new Date(targetYear, 0, 1);
  const lastDay = new Date(targetYear, 11, 31);
  const sundayStartOffset = firstDay.getDay();
  const daysInYear = Math.floor((lastDay - firstDay) / (24 * 60 * 60 * 1000)) + 1;
  const totalCells = Math.ceil((sundayStartOffset + daysInYear) / 7) * 7;
  const normalizedCells = Array.from({ length: totalCells }, () => 0);
  const normalizedDates = Array.from({ length: totalCells }, () => null);
  const monthLabelByWeek = Array.from({ length: totalCells / 7 }, () => '');
  let contributionTotal = 0;

  const dateCountMap = new Map();
  for (let day = 0; day < daysInYear; day += 1) {
    const currentDate = new Date(targetYear, 0, day + 1);
    const cellDate = toDateParam(currentDate);
    const targetIndex = sundayStartOffset + day;
    normalizedDates[targetIndex] = cellDate;
  }

  if (Array.isArray(list)) {
    list.forEach((item) => {
      const dateKey = String(item?.date || item?.workoutDate || item?.targetDate || '').slice(0, 10);
      if (!dateKey) return;
      const count = Number(item?.count || item?.value || item?.workoutCount || 0);
      dateCountMap.set(dateKey, count);
      contributionTotal += count;
    });
  }

  if (dateCountMap.size > 0) {
    for (let day = 0; day < daysInYear; day += 1) {
      const cellDate = toDateParam(new Date(targetYear, 0, day + 1));
      normalizedCells[sundayStartOffset + day] = Number(dateCountMap.get(cellDate) || 0);
    }
  } else {
    const values = Array.isArray(list)
      ? list.map((item) => Number(item?.count || item?.value || item?.workoutCount || item || 0))
      : [];
    for (let day = 0; day < daysInYear; day += 1) {
      const value = Number(values[day] || 0);
      normalizedCells[sundayStartOffset + day] = value;
      contributionTotal += value;
    }
  }

  let lastMonth = -1;
  for (let week = 0; week < monthLabelByWeek.length; week += 1) {
    for (let day = 0; day < 7; day += 1) {
      const dateString = normalizedDates[week * 7 + day];
      if (!dateString) continue;
      const parsed = new Date(`${dateString}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) continue;
      const month = parsed.getMonth();
      if (month !== lastMonth) {
        monthLabelByWeek[week] = `${month + 1}월`;
        lastMonth = month;
      }
      break;
    }
  }

  const weekCount = totalCells / 7;
  return {
    values: Array.from({ length: weekCount }, (_, week) => (
      Array.from({ length: 7 }, (_, day) => normalizedCells[week * 7 + day] || 0)
    )),
    dates: Array.from({ length: weekCount }, (_, week) => (
      Array.from({ length: 7 }, (_, day) => normalizedDates[week * 7 + day] || null)
    )),
    monthLabelByWeek,
    totalContributions: contributionTotal,
  };
};

const createEmptyYearlyHeatmap = (targetYear = new Date().getFullYear()) => createYearlyHeatmapGrid([], targetYear);

const applyHeatmap = (payload = {}) => {
  heatmapData.value = Array.isArray(payload.values) ? payload.values : [];
  heatmapDateData.value = Array.isArray(payload.dates) ? payload.dates : [];
  heatmapMonthLabelByWeek.value = Array.isArray(payload.monthLabelByWeek) ? payload.monthLabelByWeek : [];
  heatmapContributionTotal.value = Number(payload.totalContributions || 0);
};

const toHeatmapMetric = (value, fallback) => {
  const numeric = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(numeric) && numeric > 0 ? Number(numeric.toFixed(2)) : fallback;
};

const syncHeatmapLayoutMetrics = () => {
  if (typeof window === 'undefined') return;

  const root = heatmapActivityMainRef.value;
  if (!root) return;

  const firstCell = root.querySelector('.v-heatmap-cell');
  const monthRow = root.querySelector('.v-profile-heatmap-month-row');
  const nextCellSize = toHeatmapMetric(firstCell?.getBoundingClientRect?.().height, DEFAULT_HEATMAP_CELL_SIZE);
  const nextMonthRowHeight = toHeatmapMetric(monthRow?.getBoundingClientRect?.().height, DEFAULT_HEATMAP_MONTH_OFFSET - 6);
  const nextMonthRowMarginBottom = monthRow
    ? toHeatmapMetric(window.getComputedStyle(monthRow).marginBottom, 0)
    : 0;

  heatmapCellSize.value = nextCellSize;
  heatmapMonthOffset.value = Number((nextMonthRowHeight + nextMonthRowMarginBottom).toFixed(2));
};

const getHeatmapCellDate = (weekIndex, dayIndex) => (
  heatmapDateData.value?.[weekIndex]?.[dayIndex] || null
);

const formatHeatmapHoverDate = (value) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '';

  const [year, month, day] = normalized.split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) return normalized;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return normalized;

  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} ${weekdayNames[date.getDay()]}요일`;
};

const isHeatmapCellClickable = (weekIndex, dayIndex, value) => {
  const date = getHeatmapCellDate(weekIndex, dayIndex);
  return Boolean(date) && Number(value || 0) > 0;
};

const getHeatmapHoverDate = (weekIndex, dayIndex, value) => {
  if (!isHeatmapCellClickable(weekIndex, dayIndex, value)) return null;
  return formatHeatmapHoverDate(getHeatmapCellDate(weekIndex, dayIndex));
};

const getHeatmapAriaLabel = (weekIndex, dayIndex, value) => {
  const hoverDate = getHeatmapHoverDate(weekIndex, dayIndex, value);
  return hoverDate ? `${hoverDate} 운동 기록 보기` : null;
};

const showHeatmapTooltip = (event, weekIndex, dayIndex, value) => {
  const text = getHeatmapHoverDate(weekIndex, dayIndex, value);
  if (!text) {
    hideHeatmapTooltip();
    return;
  }

  if (typeof window !== 'undefined') {
    const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;
    if (!canHover) {
      hideHeatmapTooltip();
      return;
    }
  }

  const root = heatmapActivityMainRef.value;
  const target = event?.currentTarget;
  if (!root || !target) return;

  const rootRect = root.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  heatmapTooltip.value = {
    visible: true,
    text,
    left: targetRect.left - rootRect.left + (targetRect.width / 2),
    top: targetRect.bottom - rootRect.top + 18,
  };
};

const hideHeatmapTooltip = () => {
  heatmapTooltip.value = {
    visible: false,
    text: '',
    left: 0,
    top: 0,
  };
};

const openWorkoutByDate = (weekIndex, dayIndex, value) => {
  if (!isHeatmapCellClickable(weekIndex, dayIndex, value)) return;
  const date = getHeatmapCellDate(weekIndex, dayIndex);
  if (!date) return;
  router.push({
    path: '/workoutHistory',
    query: {
      date,
      ...(routeTargetUserId.value ? { userId: String(routeTargetUserId.value) } : {}),
    },
  });
};

const loadHeatmapData = async () => {
  const targetYear = Number(selectedHeatmapYear.value || new Date().getFullYear());

  if (isGymOwner.value) {
    applyHeatmap(createEmptyYearlyHeatmap(targetYear));
    return;
  }

  try {
    const from = new Date(targetYear, 0, 1);
    const to = new Date(targetYear, 11, 31);
    const requestedUserId = Number(normalizedProfileUserId.value || 0) || null;

    const response = await workoutApi.heatmap({
      from: toDateParam(from),
      to: toDateParam(to),
      ...(requestedUserId ? { userId: requestedUserId } : {}),
    });
    const payload = response?.data?.data || response?.data?.result || response?.data || [];
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.list)
          ? payload.list
          : [];
    applyHeatmap(createYearlyHeatmapGrid(list, targetYear));
  } catch (error) {
    applyHeatmap(createEmptyYearlyHeatmap(targetYear));
  }
};

const changeHeatmapYear = async (year) => {
  const normalizedYear = Number(year);
  if (!Number.isFinite(normalizedYear) || normalizedYear <= 0) return;
  if (normalizedYear === selectedHeatmapYear.value) {
    isHeatmapYearDropdownOpen.value = false;
    return;
  }
  selectedHeatmapYear.value = normalizedYear;
  isHeatmapYearDropdownOpen.value = false;
  await loadHeatmapData();
};

const toggleHeatmapYearDropdown = () => {
  isHeatmapYearDropdownOpen.value = !isHeatmapYearDropdownOpen.value;
};

const handleDocumentClick = (event) => {
  if (!isHeatmapYearDropdownOpen.value) return;
  const root = heatmapYearDropdownRef.value;
  if (!root) return;
  if (root.contains(event.target)) return;
  isHeatmapYearDropdownOpen.value = false;
};

const resolveEarliestWorkoutYear = async () => {
  const currentYear = new Date().getFullYear();
  if (isGymOwner.value || shouldMaskPrivateProfile.value) return currentYear;

  try {
    const requestedUserId = Number(normalizedProfileUserId.value || 0) || null;
    const response = await workoutApi.heatmap({
      from: '2000-01-01',
      to: `${currentYear}-12-31`,
      ...(requestedUserId ? { userId: requestedUserId } : {}),
    });
    const payload = response?.data?.data || response?.data?.result || response?.data || [];
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.list)
          ? payload.list
          : [];

    const validYears = list
      .map((item) => String(item?.date || item?.workoutDate || item?.targetDate || '').slice(0, 4))
      .map((yearText) => Number(yearText))
      .filter((year) => Number.isFinite(year) && year >= 2000 && year <= currentYear);

    if (validYears.length === 0) return currentYear;
    return Math.min(...validYears);
  } catch (error) {
    return currentYear;
  }
};

const createWorkout = async () => {
  try {
    const workoutDateRaw = String(workoutForm.value.dateTime || '').trim();
    if (!workoutDateRaw) {
      window.alert('운동 날짜와 시간을 선택해주세요.');
      return;
    }
    let workoutDate = workoutDateRaw;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(workoutDateRaw)) {
      workoutDate = `${workoutDateRaw}:00`;
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(workoutDateRaw)) {
      workoutDate = workoutDateRaw.slice(0, 19);
    }

    const selectedWorkoutDate = new Date(workoutDate);
    if (Number.isNaN(selectedWorkoutDate.getTime())) {
      window.alert('운동 날짜와 시간을 올바르게 입력해주세요.');
      return;
    }
    if (selectedWorkoutDate.getTime() > Date.now()) {
      syncWorkoutDateTimeMax();
      workoutForm.value.dateTime = workoutDateTimeMax.value;
      window.alert('미래의 시간은 선택할 수 없습니다');
      return;
    }

    const details = workoutForm.value.exercises
      .filter((item) => item.weight || item.sets || item.reps || item.name)
      .map((item, index) => ({
        workoutName: item.name || `운동 ${index + 1}`,
        weight: Number(item.weight || 0),
        setCount: Number(item.sets || 0),
        rep: Number(item.reps || 0),
      }));
    await workoutApi.create({
      workoutDate,
      workoutDetailCreateDtoList: details,
    });
    closeWorkoutModal();
    workoutForm.value = createEmptyWorkoutForm();
    await loadProfileData();
  } catch (error) {
    console.error('Create workout failed:', error);
  }
};

watch(
  () => route.fullPath,
  () => {
    loadProfileData();
  },
);

watch(
  [heatmapData, heatmapMonthLabelByWeek],
  () => {
    syncHeatmapLayoutMetrics();
  },
  { flush: 'post' },
);

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  window.addEventListener('resize', syncHeatmapLayoutMetrics);
  loadProfileData();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
  window.removeEventListener('resize', syncHeatmapLayoutMetrics);
});
</script>

<style scoped>
.v-owner-wrap {
  display: grid;
  gap: 16px;
}

.v-owner-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .v-owner-info-grid {
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
  }
}

.v-profile-stat-button {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.v-profile-stat-button:hover .v-profile-stat-value {
  color: #2563eb;
}

.v-profile-activity-wrap {
  display: block;
  align-items: start;
}

.v-profile-activity-main {
  position: relative;
  overflow: visible;
  min-width: 0;
}

.v-profile-activity-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.v-profile-activity-pill-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.v-profile-activity-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.v-profile-activity-pill-green {
  border: 1px solid #b7e8cb;
  color: #16a34a;
  background: #effcf4;
}

.v-profile-activity-pill-orange {
  border: 1px solid #fdcf9d;
  color: #f97316;
  background: #fff7ed;
}

.v-profile-activity-pill-gray {
  border: 1px solid #e2e8f0;
  color: #475569;
  background: #f8fafc;
}

.v-profile-activity-grid-wrap {
  display: flex;
  gap: 8px;
  min-width: 0;
  --heatmap-cell-size: 14px;
  --heatmap-month-offset: 18px;
}

.v-profile-activity-days {
  padding-top: var(--heatmap-month-offset);
  flex-shrink: 0;
  display: grid;
  grid-template-rows: repeat(7, var(--heatmap-cell-size));
  gap: 4px;
  align-items: start;
}

.v-profile-activity-days span {
  width: 14px;
  height: var(--heatmap-cell-size);
  font-size: 11px;
  line-height: 1;
  color: #94a3b8;
  text-align: right;
  min-height: var(--heatmap-cell-size);
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
}

.v-profile-activity-grid-scroll {
  overflow-x: hidden;
  padding-bottom: 2px;
  width: 100%;
}

.v-profile-heatmap-month-row {
  display: grid;
  grid-template-columns: repeat(var(--heatmap-week-count, 53), minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 6px;
  min-width: 0;
  width: 100%;
}

.v-profile-heatmap-month-cell {
  width: auto;
  min-width: 0;
  font-size: 10px;
  line-height: 1.2;
  color: #94a3b8;
  white-space: nowrap;
}

.v-profile-activity-years {
  position: relative;
  width: auto;
  flex-shrink: 0;
}

.v-profile-year-button {
  width: auto;
  border: 0;
  background: transparent;
  border-radius: 0;
  min-height: auto;
  padding: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  transition: all 0.2s ease;
}

.v-profile-year-button:hover {
  color: #1d4ed8;
}

.v-profile-year-button-active {
  color: #1e293b;
}

.v-profile-year-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: auto;
  min-width: 120px;
  max-height: 260px;
  overflow-y: auto;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid #dbe3ef;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
  z-index: 30;
  display: grid;
  gap: 4px;
}

.v-profile-year-option {
  width: 100%;
  min-height: 46px;
  border: 0;
  border-radius: 9px;
  background: #ffffff;
  color: #475569;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.v-profile-year-option:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.v-profile-year-option-active {
  background: #e0ecff;
  color: #1d4ed8;
}

.v-profile-activity-grid-scroll .sx-views-user-profile-profileview-012 {
  display: grid;
  grid-template-columns: repeat(var(--heatmap-week-count, 53), minmax(0, 1fr));
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.v-profile-activity-grid-scroll .sx-views-user-profile-profileview-013 {
  display: grid;
  grid-template-rows: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.v-profile-activity-main .v-heatmap-legend-cell,
.v-profile-activity-main .v-heatmap-cell {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 3px;
}

.v-profile-activity-main .v-heatmap-cell-clickable {
  position: relative;
}

.v-profile-activity-main .v-profile-heatmap-month-cell {
  width: 14px;
  min-width: 14px;
}

.v-profile-heatmap-tooltip {
  position: absolute;
  transform: translateX(-50%);
  padding: 8px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.22);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  z-index: 20;
  pointer-events: none;
}

.v-profile-heatmap-tooltip::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -6px;
  width: 10px;
  height: 10px;
  transform: translateX(-50%) rotate(45deg);
  background: #1e293b;
  border-inline-start: 1px solid rgba(148, 163, 184, 0.28);
  border-top: 1px solid rgba(148, 163, 184, 0.28);
}

@media (hover: hover) and (pointer: fine) {
  .v-profile-activity-grid-scroll {
    padding-bottom: 6px;
  }
}

.v-follow-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.45);
}

.v-follow-modal {
  width: 100%;
  max-width: 520px;
  max-height: min(78vh, 720px);
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.28);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.v-follow-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 16px;
  gap: 8px;
}

.v-follow-modal-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-follow-modal-tab {
  border: 0;
  background: transparent;
  border-radius: 9999px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}

.v-follow-modal-tab-active {
  background: #eff6ff;
  color: #1d4ed8;
}

.v-follow-modal-close {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.v-follow-modal-body {
  flex: 1;
  min-height: 240px;
  overflow-y: auto;
}

.v-follow-modal-empty {
  margin: 0;
  padding: 36px 20px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.v-follow-modal-error {
  color: #dc2626;
}

.v-follow-modal-list {
  display: grid;
  gap: 2px;
  padding: 8px;
}

.v-follow-modal-item {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.v-follow-modal-item:hover {
  background: #f8fafc;
}

.v-follow-modal-avatar {
  width: 42px;
  height: 42px;
  border-radius: 9999px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.v-follow-modal-meta {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 2px;
  text-align: left;
}

.v-follow-modal-meta strong {
  font-size: 14px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-follow-modal-meta span {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-follow-modal-chip {
  border-radius: 9999px;
  padding: 4px 8px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .v-profile-activity-grid-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    padding-bottom: 6px;
  }

  .v-profile-activity-grid-scroll::-webkit-scrollbar {
    display: none;
  }

  .v-profile-heatmap-month-row,
  .v-profile-activity-grid-scroll .sx-views-user-profile-profileview-012 {
    width: max-content;
    min-width: max-content;
    grid-template-columns: repeat(var(--heatmap-week-count, 53), 14px);
  }

  .v-profile-year-button {
    width: auto;
    min-height: auto;
    padding: 0;
  }

  .v-profile-year-dropdown {
    position: absolute;
    right: 0;
    margin-top: 8px;
    max-height: 200px;
  }

  .v-follow-modal-backdrop {
    padding: 0;
  }

  .v-follow-modal {
    max-width: 100vw;
    max-height: 100vh;
    height: 100%;
    border-radius: 0;
  }

  .v-follow-modal-head {
    padding: 14px 12px;
  }

  .v-follow-modal-tab {
    font-size: 13px;
    padding: 7px 10px;
  }
}

.v-profile-log-empty {
  margin: 0;
  padding: 18px 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
}

.v-profile-side-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.v-profile-reservation-preview {
  display: grid;
  gap: 10px;
  padding: 18px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%);
  border: 1px solid #dbeafe;
}

.v-profile-reservation-preview-loading {
  color: #64748b;
  font-size: 14px;
}

.v-profile-reservation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.v-profile-reservation-phase {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
}

.v-profile-reservation-phase-upcoming {
  background: #dbeafe;
  color: #1d4ed8;
}

.v-profile-reservation-phase-past {
  background: #f1f5f9;
  color: #475569;
}

.v-profile-reservation-phase-cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.v-profile-reservation-relative {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.v-profile-reservation-note {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
}

.v-owner-hero-card {
  display: grid;
  gap: 20px;
}

.v-owner-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.v-owner-profile-summary {
  display: flex;
  align-items: center;
  gap: 20px;
}

@media (max-width: 767px) {
  .v-profile-side-card-head,
  .v-profile-reservation-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .v-owner-head {
    flex-direction: column;
  }

  .v-owner-profile-summary {
    width: 100%;
    align-items: flex-start;
  }

  .v-owner-head-action {
    width: 100%;
    justify-content: center;
  }

  .v-owner-image-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.v-owner-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.v-profile-owner-apply-msg {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.v-profile-owner-apply-msg-success {
  color: #16a34a;
}

.v-profile-owner-apply-msg-error {
  color: #dc2626;
}

.v-footer-link-button {
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.v-footer-link-button:hover {
  text-decoration: underline;
}

.v-owner-apply-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  padding: 20px;
}

.v-owner-apply-modal {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}

.v-owner-apply-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.v-owner-apply-modal-body {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.v-owner-apply-modal-desc {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.v-owner-apply-modal-input {
  min-height: 44px;
  text-align: left;
  padding-left: 14px;
}

.v-owner-apply-modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 14px 20px 20px;
}

.v-owner-sub {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.v-owner-head-action {
  min-height: 44px;
  white-space: nowrap;
}

.v-owner-panel-card {
  display: grid;
  gap: 12px;
}

.v-owner-panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.v-owner-read-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.v-owner-read-item {
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
}

.v-owner-read-item span {
  font-size: 12px;
  color: #64748b;
}

.v-owner-read-item strong {
  font-size: 14px;
  color: #0f172a;
}

.v-owner-read-item-full {
  grid-column: 1 / -1;
}

.v-owner-read-hours {
  display: grid;
  gap: 6px;
}

.v-owner-read-hour-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  padding: 10px 12px;
  font-size: 13px;
}

.v-owner-read-hour-row strong {
  color: #0f172a;
}

.v-owner-products-card {
  display: flex !important;
  flex-direction: column;
  height: 100%;
}

.v-owner-read-products {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

.v-owner-read-product {
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 14px 20px; /* 내부 여백도 살짝 키움 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px; /* 글자 크기 살짝 키움 */
  width: 100%;
  max-width: 400px; /* 최대 너비 확장 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.v-owner-read-product strong {
  color: #0f172a;
  font-weight: 700;
}

.v-owner-read-text {
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
}

.v-owner-row-gap {
  display: grid;
  gap: 8px;
}

.v-owner-image-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.v-owner-image-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 8px;
  display: grid;
  gap: 8px;
}

.v-owner-image-thumb {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 8px;
  background: #e2e8f0;
}

.v-owner-exception-row {
  display: block;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
}

.v-owner-exception-date {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.v-owner-exception-help {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.v-owner-booked-users-wrap {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

.v-owner-booked-label {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

.v-owner-booked-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.v-owner-booked-user-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

@media (min-width: 900px) {
  .v-owner-wrap {
    gap: 20px;
  }

  .v-owner-hero-card {
    gap: 24px;
  }

  .v-owner-read-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
