<template>
  <div class="screen-rail-slate">
    <NavigationRail />

    <div class="sx-views-user-profile-profilehistoryview-001">
      <div class="v-profile-history-wrap">
        <div class="sx-views-community-communityview-016">
          <RouterLink :to="profileLink" class="v-history-back-btn">
            <ArrowLeft class="v-icon-18-md20" />
          </RouterLink>
          <div>
            <h1 class="v-history-title">
              <UserRound class="v-history-title-icon" />
              {{ isGymOwner ? '시설 정보 수정' : '프로필 관리' }}
            </h1>
            <p class="v-profile-history-subtitle">
              {{ isGymOwner ? '헬스장 운영 정보를 수정하세요.' : '프로필 정보와 계정을 관리하세요.' }}
            </p>
          </div>
        </div>

        <template v-if="isGymOwner">
          <div class="view-card owner-edit-page">
            <section class="owner-edit-section">
              <h2>기본 정보</h2>
              <div class="owner-edit-grid owner-edit-grid-2">
                <label class="owner-edit-field">
                  <span>짐 이름</span>
                  <input v-model="gymForm.name" type="text" class="v-modal-line-input" />
                </label>
                <label class="owner-edit-field">
                  <span>전화번호</span>
                  <input v-model="gymForm.tel" type="text" class="v-modal-line-input" />
                </label>
              </div>
              <label class="owner-edit-field">
                <span>주소</span>
                <div class="owner-edit-address-row">
                  <input
                    :value="gymForm.address"
                    type="text"
                    readonly
                    placeholder="주소 검색으로 시설 주소를 선택하세요"
                    class="v-modal-line-input owner-edit-address-input"
                  />
                  <button type="button" class="v-modal-cancel-btn owner-edit-address-btn" @click="openAddressSearchModal">
                    주소 검색
                  </button>
                </div>
              </label>
              <div class="owner-edit-field">
                <span>카테고리</span>
                <select
                  :value="String(gymForm.categoryId ?? '')"
                  class="v-modal-line-input owner-edit-select"
                  :disabled="isLoadingGymCategories"
                  @change="handleGymCategoryChange"
                >
                  <option value="" disabled>
                    {{ isLoadingGymCategories ? '카테고리 불러오는 중...' : '카테고리 선택' }}
                  </option>
                  <option
                    v-for="category in gymCategoryOptions"
                    :key="category.id"
                    :value="String(category.id)"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <label class="owner-edit-field">
                <span>소개</span>
                <div class="v-profile-edit-bio-wrap" :class="{ 'is-over-limit': isGymDescriptionOverLimit }">
                  <textarea
                    v-model="gymForm.description"
                    rows="4"
                    placeholder="헬스장을 소개해 보세요"
                    class="v-profile-edit-textarea owner-edit-textarea"
                    :class="{ 'is-over-limit': isGymDescriptionOverLimit }"
                  />
                </div>
                <div class="v-profile-edit-bio-meter-row">
                  <div class="v-profile-edit-bio-meter-group">
                    <div class="v-profile-edit-bio-meter" :class="{ 'is-over-limit': isGymDescriptionOverLimit }">
                      <svg viewBox="0 0 28 28" class="v-profile-edit-bio-meter-svg" aria-hidden="true">
                        <circle class="v-profile-edit-bio-meter-track" cx="14" cy="14" r="10" />
                        <circle
                          class="v-profile-edit-bio-meter-progress"
                          :class="{ 'is-over-limit': isGymDescriptionOverLimit }"
                          cx="14"
                          cy="14"
                          r="10"
                          :style="{
                            strokeDasharray: `${BIO_CIRCLE_CIRCUMFERENCE} ${BIO_CIRCLE_CIRCUMFERENCE}`,
                            strokeDashoffset: `${gymDescriptionCircleDashOffset}`,
                          }"
                        />
                      </svg>
                    </div>
                    <p class="v-profile-edit-bio-count" :class="{ 'is-over-limit': isGymDescriptionOverLimit }">
                      {{ isGymDescriptionOverLimit ? gymDescriptionRemaining : `${gymDescriptionLength}/${PROFILE_BIO_MAX_LENGTH}` }}
                    </p>
                  </div>
                </div>
              </label>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingGymProfile || isGymDescriptionOverLimit" @click="saveGymProfile">
                {{ isSavingGymProfile ? '저장 중...' : '기본 정보 저장' }}
              </button>
            </section>

            <section class="owner-edit-section">
              <h2>영업 시간</h2>
              <div class="owner-edit-hours">
                <div v-for="item in gymHours" :key="item.dayOfWeek" class="owner-edit-hour-row">
                  <span class="owner-edit-hour-day">{{ dayLabelMap[item.dayOfWeek] }}</span>
                  <label class="owner-edit-hour-closed">
                    <input v-model="item.isClosed" type="checkbox" />
                    휴무
                  </label>
                  <input v-model="item.openTime" type="time" :disabled="item.isClosed" class="v-modal-line-input" />
                  <span>~</span>
                  <input v-model="item.closeTime" type="time" :disabled="item.isClosed" class="v-modal-line-input" />
                </div>
              </div>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingGymHours" @click="saveGymHours">
                {{ isSavingGymHours ? '저장 중...' : '영업 시간 저장' }}
              </button>
            </section>

            <section class="owner-edit-section">
              <h2>편의시설</h2>
              <div class="settings-amenities-grid">
                <label v-for="amenity in availableAmenities" :key="amenity.code" class="settings-checkbox-field">
                  <input type="checkbox" :value="amenity.code" v-model="selectedAmenities" />
                  <span>{{ amenity.label }}</span>
                </label>
              </div>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingAmenities" @click="saveAmenities">
                {{ isSavingAmenities ? '저장 중...' : '편의시설 저장' }}
              </button>
            </section>

            <section class="owner-edit-section">
              <h2>짐 이미지</h2>
              <input
                ref="gymImageInputRef"
                type="file"
                accept="image/*"
                multiple
                class="u-hidden"
                @change="handleImageChange"
              />
              <p class="owner-edit-help">버튼을 눌러 이미지를 선택하고 업로드하세요.</p>
              <p v-if="selectedImageNames.length" class="owner-edit-help">선택 파일: {{ selectedImageNames.join(', ') }}</p>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isUploadingImages" @click="handleGymImageAction">
                {{ isUploadingImages ? '업로드 중...' : (pendingImages.length > 0 ? '선택한 이미지 업로드' : '이미지 선택') }}
              </button>
              <div v-if="gymImages.length > 0" class="owner-edit-image-grid">
                <div v-for="image in gymImages" :key="image.key" class="owner-edit-image-card">
                  <img :src="image.url" alt="짐 이미지" class="owner-edit-image-thumb" />
                  <button type="button" class="owner-edit-small-btn" :disabled="isDeletingImage || !image.id" @click="deleteImage(image)">
                    {{ isDeletingImage ? '삭제 중...' : '삭제' }}
                  </button>
                </div>
              </div>
            </section>

            <section class="owner-edit-section">
              <h2>상품</h2>
              <div class="owner-edit-row-gap">
                <div v-for="(item, idx) in products" :key="idx" class="owner-edit-product-row">
                  <input v-model="item.productName" type="text" placeholder="상품명" class="v-modal-line-input" />
                  <input
                    :value="item.price"
                    type="number"
                    min="0"
                    placeholder="가격"
                    class="v-modal-line-input owner-edit-product-price-input"
                    @input="handleProductPriceInput(idx, $event)"
                  />
                  <button type="button" class="owner-edit-small-btn" @click="removeProduct(idx)">삭제</button>
                </div>
              </div>
              <div class="owner-edit-inline-actions">
                <button type="button" class="v-modal-cancel-btn owner-edit-action-btn" @click="addProduct">상품 추가</button>
                <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isSavingProducts" @click="saveProducts">
                  {{ isSavingProducts ? '저장 중...' : '상품 저장' }}
                </button>
              </div>
            </section>

            <section class="owner-edit-section">
              <h2>예외 운영시간</h2>
              <div class="owner-edit-grid owner-edit-grid-2">
                <label class="owner-edit-field">
                  <span>날짜</span>
                  <input v-model="exceptionForm.specificDate" type="date" class="v-modal-line-input" />
                </label>
                <label class="owner-edit-field">
                  <span>휴무 여부</span>
                  <input v-model="exceptionForm.isClosed" type="checkbox" />
                </label>
              </div>
              <div class="owner-edit-grid owner-edit-grid-2">
                <label class="owner-edit-field">
                  <span>오픈 시간</span>
                  <input v-model="exceptionForm.openTime" type="time" :disabled="exceptionForm.isClosed" class="v-modal-line-input" />
                </label>
                <label class="owner-edit-field">
                  <span>마감 시간</span>
                  <input v-model="exceptionForm.closeTime" type="time" :disabled="exceptionForm.isClosed" class="v-modal-line-input" />
                </label>
              </div>
              <label class="owner-edit-field">
                <span>사유</span>
                <input v-model="exceptionForm.description" type="text" class="v-modal-line-input" />
              </label>
              <button class="v-modal-save-btn owner-edit-action-btn" :disabled="isCreatingException" @click="createException">
                {{ isCreatingException ? '추가 중...' : '예외 시간 추가' }}
              </button>

              <div class="owner-edit-row-gap">
                <div v-for="item in exceptions" :key="item.id" class="owner-edit-exception-row">
                  <div>
                    <p class="owner-edit-date">{{ item.specificDate || item.date }}</p>
                    <p class="owner-edit-help">
                      {{ item.isClosed ? '휴무' : `${formatTime(item.openTime)} ~ ${formatTime(item.closeTime)}` }}
                      <template v-if="item.description"> · {{ item.description }}</template>
                    </p>
                  </div>
                  <button type="button" class="owner-edit-small-btn" @click="deleteException(item.id)">삭제</button>
                </div>
              </div>
            </section>

            <section class="owner-edit-section">
              <h2>예약 슬롯 관리 (자동 생성)</h2>
              <div class="owner-edit-grid owner-edit-grid-2">
                <div class="owner-edit-field">
                  <span>날짜</span>
                  <label class="v-history-control-btn v-history-date-filter owner-edit-date-filter">
                    <Calendar :size="18" />
                    <input v-model="reservationForm.date" type="date" class="v-history-date-input owner-edit-date-input" />
                  </label>
                </div>
                <label class="owner-edit-field">
                  <span>예약명</span>
                  <input v-model="reservationForm.slotName" type="text" placeholder="예: 1:1 PT 수업" class="v-modal-line-input" />
                </label>
              </div>
              <div class="owner-edit-grid owner-edit-grid-2">
                <label class="owner-edit-field">
                  <span>가격 (원)</span>
                  <input v-model.number="reservationForm.price" type="number" min="0" step="1000" class="v-modal-line-input" />
                </label>
                <label class="owner-edit-field">
                  <span>정원 (명)</span>
                  <input v-model.number="reservationForm.maxCapacity" type="number" min="1" class="v-modal-line-input" />
                </label>
              </div>
              <button type="button" class="v-modal-save-btn owner-edit-action-btn" :disabled="isCreatingReservation" @click="createDailySlots">
                {{ isCreatingReservation ? '생성 중...' : '예약 슬롯 일괄 생성' }}
              </button>
            </section>

          </div>
        </template>

        <template v-else>
          <div class="view-card-sm v-profile-edit-layout">
            <div class="v-profile-edit-main">
              <div class="v-profile-edit-avatar-wrap">
                <div class="v-profile-edit-avatar-frame">
                  <img :src="form.profileImage" alt="프로필" class="v-cover-image" @error="handleUserAvatarError" />
                </div>
                <button class="v-profile-edit-avatar-btn" type="button" @click="openProfileImagePicker">
                  <Camera class="v-icon-18-md20" />
                  사진 변경
                </button>
                <input
                  ref="profileImageInputRef"
                  type="file"
                  accept="image/*"
                  class="u-hidden"
                  @change="onProfileImageChange"
                />
              </div>

              <div class="v-profile-edit-form">
                <label class="v-form-label">
                  이름
                  <input v-model="form.userName" type="text" class="v-history-search-input v-profile-edit-input v-profile-edit-input-left" placeholder="이름을 입력하세요" />
                </label>

                <label class="v-form-label">
                  닉네임
                  <input v-model="form.nickName" type="text" class="v-history-search-input v-profile-edit-input v-profile-edit-input-left" placeholder="닉네임을 입력하세요" />
                </label>

                <label class="v-form-label">
                  이메일
                  <div class="v-profile-email-verify-wrap">
                    <div class="v-profile-email-row">
                      <input
                        v-model="form.email"
                        type="email"
                        class="v-history-search-input v-profile-edit-input v-profile-edit-input-left"
                        placeholder="이메일을 입력하세요"
                      />
                      <button
                        type="button"
                        class="v-profile-email-btn"
                        :disabled="isSendingEmailCode || !isEmailChangeRequested || isEmailChangeVerifiedForCurrent"
                        @click="sendEmailVerificationCode"
                      >
                        {{ isSendingEmailCode ? '발송 중...' : (isEmailCodeSent ? '재전송' : '인증') }}
                      </button>
                    </div>

                    <div v-if="isEmailCodeSent || isEmailChangeVerifiedForCurrent" class="v-profile-email-row">
                      <input
                        v-model="emailVerificationCode"
                        type="text"
                        class="v-history-search-input v-profile-edit-input v-profile-edit-input-left"
                        placeholder="인증코드 입력"
                        :disabled="isEmailChangeVerifiedForCurrent"
                      />
                      <button
                        type="button"
                        class="v-profile-email-btn v-profile-email-btn-verify"
                        :disabled="!isEmailCodeSent || isVerifyingEmailCode || isEmailChangeVerifiedForCurrent"
                        @click="verifyEmailCode"
                      >
                        {{ isEmailChangeVerifiedForCurrent ? '인증 완료' : (isVerifyingEmailCode ? '확인 중...' : '인증') }}
                      </button>
                    </div>

                    <p
                      v-if="emailVerifyMessage"
                      class="v-profile-email-msg v-profile-email-msg-success"
                    >
                      {{ emailVerifyMessage }}
                    </p>
                    <p
                      v-else-if="emailVerifyError"
                      class="v-profile-email-msg v-profile-email-msg-error"
                    >
                      {{ emailVerifyError }}
                    </p>
                  </div>
                </label>

                <label class="v-form-label">
                  소개
                  <div class="v-profile-edit-bio-wrap" :class="{ 'is-over-limit': isBioOverLimit }">
                    <div
                      ref="bioEditorRef"
                      class="v-profile-edit-textarea"
                      :class="{ 'is-over-limit': isBioOverLimit }"
                      contenteditable="true"
                      role="textbox"
                      aria-multiline="true"
                      data-placeholder="자신을 소개해 보세요"
                      @input="onBioInput"
                      @blur="onBioBlur"
                      @paste="onBioPaste"
                      @compositionstart="onBioCompositionStart"
                      @compositionend="onBioCompositionEnd"
                    ></div>
                  </div>
                  <div class="v-profile-edit-bio-meter-row">
                    <div class="v-profile-edit-bio-meter-group">
                      <div class="v-profile-edit-bio-meter" :class="{ 'is-over-limit': isBioOverLimit }">
                        <svg viewBox="0 0 28 28" class="v-profile-edit-bio-meter-svg" aria-hidden="true">
                          <circle class="v-profile-edit-bio-meter-track" cx="14" cy="14" r="10" />
                          <circle
                            class="v-profile-edit-bio-meter-progress"
                            :class="{ 'is-over-limit': isBioOverLimit }"
                            cx="14"
                            cy="14"
                            r="10"
                            :style="{
                              strokeDasharray: `${BIO_CIRCLE_CIRCUMFERENCE} ${BIO_CIRCLE_CIRCUMFERENCE}`,
                              strokeDashoffset: `${bioCircleDashOffset}`,
                            }"
                          />
                        </svg>
                      </div>
                      <p class="v-profile-edit-bio-count" :class="{ 'is-over-limit': isBioOverLimit }">
                        {{ isBioOverLimit ? bioRemaining : `${bioLength}/${PROFILE_BIO_MAX_LENGTH}` }}
                      </p>
                    </div>
                  </div>
                </label>

              </div>
            </div>

            <div class="v-profile-edit-side">
              <h3 class="v-profile-edit-side-title">공개 설정</h3>
              <div class="v-profile-edit-toggle-item">
                <div>
                  <p class="v-profile-edit-toggle-label">프로필 공개</p>
                  <p class="v-profile-edit-toggle-desc">다른 사용자가 내 프로필을 볼 수 있어요.</p>
                </div>
                <button type="button" class="v-profile-edit-toggle" :class="form.isPublic ? 'v-toggle-on' : 'v-toggle-off'" @click="form.isPublic = !form.isPublic">
                  <span class="v-profile-edit-toggle-knob" :class="form.isPublic ? 'v-toggle-knob-on' : 'v-toggle-knob-off'" />
                </button>
              </div>
              <div class="v-profile-edit-toggle-item">
                <div>
                  <p class="v-profile-edit-toggle-label">활동 통계 공개</p>
                  <p class="v-profile-edit-toggle-desc">운동 기록 통계를 다른 사용자에게 보여줘요.</p>
                </div>
                <button type="button" class="v-profile-edit-toggle" :class="form.showStats ? 'v-toggle-on' : 'v-toggle-off'" @click="form.showStats = !form.showStats">
                  <span class="v-profile-edit-toggle-knob" :class="form.showStats ? 'v-toggle-knob-on' : 'v-toggle-knob-off'" />
                </button>
              </div>
            </div>
            <div class="v-profile-edit-actions">
              <RouterLink :to="profileLink" class="v-modal-cancel-btn v-profile-edit-action-btn">취소</RouterLink>
              <button class="v-modal-save-btn v-profile-edit-action-btn" type="button" :disabled="isBioOverLimit || isSavingProfile" @click="saveProfile">
                {{ isSavingProfile ? '저장 중...' : '수정하기' }}
              </button>
            </div>
          </div>
          <div class="v-profile-edit-account-bottom">
            <button
              type="button"
              class="v-profile-delete-link"
              :disabled="isProcessingAccountAction"
              @click="openDeleteAccountModal"
            >
              회원탈퇴
            </button>
          </div>
        </template>
      </div>
    </div>

    <div
      v-if="profileSaveModal.open"
      class="view-modal-backdrop v-profile-save-modal-backdrop"
      role="button"
      tabindex="0"
      aria-label="프로필 수정 결과 모달 닫기"
      @click.self="handleProfileSaveModalConfirm"
      @keyup.enter="handleProfileSaveModalConfirm"
    >
      <div class="view-modal-panel v-profile-save-modal" role="dialog" aria-modal="true" aria-labelledby="profile-save-modal-title" @click.stop>
        <div class="v-profile-save-modal-body">
          <h2 id="profile-save-modal-title" class="v-modal-title">{{ profileSaveModal.title }}</h2>
          <p class="v-profile-save-modal-copy">{{ profileSaveModal.message }}</p>
          <p
            v-if="profileSaveModal.detail"
            class="v-profile-save-modal-detail"
            :class="profileSaveModal.tone === 'error' ? 'v-profile-save-modal-detail-error' : ''"
          >
            {{ profileSaveModal.detail }}
          </p>
        </div>
        <div class="v-profile-save-modal-actions">
          <button type="button" class="v-modal-save-btn v-profile-save-modal-confirm" @click="handleProfileSaveModalConfirm">
            확인
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isDeleteAccountModalOpen"
      class="view-modal-backdrop v-profile-delete-modal-backdrop"
      role="button"
      tabindex="0"
      aria-label="회원탈퇴 확인 모달 닫기"
      @click.self="closeDeleteAccountModal"
      @keyup.enter="closeDeleteAccountModal"
    >
      <div class="view-modal-panel v-profile-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-account-modal-title" @click.stop>
        <div class="v-profile-delete-modal-body">
          <h2 id="delete-account-modal-title" class="v-modal-title">회원탈퇴</h2>
          <p class="v-profile-delete-modal-copy">
            정말 회원탈퇴를 진행하시겠습니까?
          </p>
          <p class="v-profile-delete-modal-copy v-profile-delete-modal-copy-muted">
            탈퇴 후에는 계정을 다시 복구할 수 없습니다.
          </p>
          <p v-if="deleteAccountError" class="v-profile-delete-modal-error">{{ deleteAccountError }}</p>
        </div>
        <div class="v-profile-delete-modal-actions">
          <button type="button" class="v-modal-cancel-btn" :disabled="isProcessingAccountAction" @click="closeDeleteAccountModal">
            취소
          </button>
          <button type="button" class="v-modal-save-btn v-profile-delete-modal-confirm" :disabled="isProcessingAccountAction" @click="deleteAccount">
            {{ isProcessingAccountAction ? '처리 중...' : '탈퇴하기' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isAddressSearchModalOpen"
      class="view-modal-backdrop v-profile-save-modal-backdrop"
      role="button"
      tabindex="0"
      aria-label="주소 검색 모달 닫기"
      @click.self="closeAddressSearchModal"
      @keyup.enter="closeAddressSearchModal"
    >
      <div class="view-modal-panel owner-edit-address-modal" role="dialog" aria-modal="true" aria-labelledby="owner-address-search-title" @click.stop>
        <div class="v-profile-save-modal-body">
          <h2 id="owner-address-search-title" class="v-modal-title">주소 검색</h2>
          <p class="v-profile-save-modal-copy">네이버 지도 주소 검색으로 시설 주소를 찾습니다.</p>
          <div class="owner-edit-address-search-row">
            <input
              v-model="addressSearchQuery"
              type="text"
              class="v-modal-line-input owner-edit-address-search-input"
              placeholder="도로명 주소 또는 지번을 입력하세요"
              @keydown.enter.prevent="searchAddress"
            />
            <button type="button" class="v-modal-save-btn owner-edit-address-search-submit" :disabled="isSearchingAddress" @click="searchAddress">
              {{ isSearchingAddress ? '검색 중...' : '검색' }}
            </button>
          </div>
          <p v-if="addressSearchError" class="owner-edit-error">{{ addressSearchError }}</p>
          <div v-else-if="addressSearchResult" class="owner-edit-address-result">
            <strong>{{ addressSearchResult.roadAddress || addressSearchResult.jibunAddress }}</strong>
            <p v-if="addressSearchResult.roadAddress">도로명: {{ addressSearchResult.roadAddress }}</p>
            <p v-if="addressSearchResult.jibunAddress">지번: {{ addressSearchResult.jibunAddress }}</p>
          </div>
        </div>
        <div class="v-profile-save-modal-actions owner-edit-address-modal-actions">
          <button type="button" class="v-modal-cancel-btn" @click="closeAddressSearchModal">닫기</button>
          <button type="button" class="v-modal-save-btn" :disabled="!addressSearchResult" @click="applySearchedAddress">
            이 주소 사용
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRouter, RouterLink, useRoute } from 'vue-router';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { ArrowLeft, UserRound, Camera, Calendar } from 'lucide-vue-next';
import { gymApi, userApi, reservationApi, mapApi } from '@/services/apis';
import { normalizeRole, setAuthTokens } from '@/services/token';
import { notifyAuthInvalidated } from '@/services/authLifecycle';
import { extractList, extractPayload } from '@/utils/api';
import { useSession } from '@/composables/useSession';
import { USER_AVATAR_PLACEHOLDER, resolveUserAvatar, handleUserAvatarError } from '@/utils/userAvatar';

const router = useRouter();
const route = useRoute();
const { sessionProfile, primeSessionFromToken, syncSessionFromServer } = useSession();
const PROFILE_BIO_MAX_LENGTH = 120;
const BIO_CIRCLE_RADIUS = 10;
const BIO_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * BIO_CIRCLE_RADIUS;

const previewRole = computed(() => normalizeRole(route.query.previewRole));
const loadedProfileRole = ref(null);
const effectiveRole = computed(() => previewRole.value || loadedProfileRole.value || normalizeRole(sessionProfile.value?.role) || 'USER');
const isGymOwner = computed(() => effectiveRole.value === 'GYM_OWNER');
const profileNavigationRole = computed(() => previewRole.value || loadedProfileRole.value || (isGymOwner.value ? 'GYM_OWNER' : null));
const profileLink = computed(() => (
  profileNavigationRole.value
    ? { path: '/profile', query: { previewRole: profileNavigationRole.value } }
    : { path: '/profile' }
));

const form = ref({
  userName: '',
  nickName: '',
  email: '',
  bio: '',
  profileImage: USER_AVATAR_PLACEHOLDER,
  isPublic: true,
  showStats: true,
});
const originalEmail = ref('');
const verifiedEmail = ref('');
const emailVerificationCode = ref('');
const isSendingEmailCode = ref(false);
const isEmailCodeSent = ref(false);
const isVerifyingEmailCode = ref(false);
const emailVerifyMessage = ref('');
const emailVerifyError = ref('');
const profileImageInputRef = ref(null);
const profileImageFile = ref(null);
const profileImagePreviewUrl = ref(null);
const isSavingProfile = ref(false);
const profileSaveModal = ref({
  open: false,
  tone: 'success',
  title: '',
  message: '',
  detail: '',
  redirectToProfile: false,
});
const isDeleteAccountModalOpen = ref(false);
const deleteAccountError = ref('');

const bioEditorRef = ref(null);
const isBioComposing = ref(false);
const bioChars = computed(() => Array.from(String(form.value.bio || '')));
const bioLength = computed(() => bioChars.value.length);
const bioRemaining = computed(() => PROFILE_BIO_MAX_LENGTH - bioLength.value);
const isBioOverLimit = computed(() => bioRemaining.value < 0);
const bioSafeText = computed(() => bioChars.value.slice(0, PROFILE_BIO_MAX_LENGTH).join(''));
const bioOverflowText = computed(() => bioChars.value.slice(PROFILE_BIO_MAX_LENGTH).join(''));
const bioCircleRatio = computed(() => Math.min(bioLength.value / PROFILE_BIO_MAX_LENGTH, 1));
const bioCircleDashOffset = computed(() => BIO_CIRCLE_CIRCUMFERENCE * (1 - bioCircleRatio.value));
const gymDescriptionChars = computed(() => Array.from(String(gymForm.value.description || '')));
const gymDescriptionLength = computed(() => gymDescriptionChars.value.length);
const gymDescriptionRemaining = computed(() => PROFILE_BIO_MAX_LENGTH - gymDescriptionLength.value);
const isGymDescriptionOverLimit = computed(() => gymDescriptionRemaining.value < 0);
const gymDescriptionCircleRatio = computed(() => Math.min(gymDescriptionLength.value / PROFILE_BIO_MAX_LENGTH, 1));
const gymDescriptionCircleDashOffset = computed(() => BIO_CIRCLE_CIRCUMFERENCE * (1 - gymDescriptionCircleRatio.value));
const normalizedCurrentEmail = computed(() => String(form.value.email || '').trim().toLowerCase());
const normalizedOriginalEmail = computed(() => String(originalEmail.value || '').trim().toLowerCase());
const isEmailChangeRequested = computed(() => (
  Boolean(normalizedCurrentEmail.value)
  && normalizedCurrentEmail.value !== normalizedOriginalEmail.value
));
const isEmailVerifiedForCurrent = computed(() => (
  Boolean(normalizedCurrentEmail.value)
  && normalizedCurrentEmail.value === verifiedEmail.value
));
const isEmailChangeVerifiedForCurrent = computed(() => (
  isEmailChangeRequested.value && isEmailVerifiedForCurrent.value
));

const normalizeBioText = (value) => (
  String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
);

const codePointLength = (value) => Array.from(String(value || '')).length;

const codePointToCodeUnitIndex = (text, codePointIndex) => {
  if (codePointIndex <= 0) return 0;
  let consumedCodePoints = 0;
  let codeUnitIndex = 0;
  for (const char of String(text || '')) {
    if (consumedCodePoints >= codePointIndex) break;
    consumedCodePoints += 1;
    codeUnitIndex += char.length;
  }
  return codeUnitIndex;
};

const getSelectionOffsetsInEditor = (editor) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return null;

  const startRange = document.createRange();
  startRange.selectNodeContents(editor);
  startRange.setEnd(range.startContainer, range.startOffset);

  const endRange = document.createRange();
  endRange.selectNodeContents(editor);
  endRange.setEnd(range.endContainer, range.endOffset);

  return {
    start: codePointLength(startRange.toString()),
    end: codePointLength(endRange.toString()),
  };
};

const resolveEditorPositionByOffset = (editor, codePointOffset) => {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(0, codePointOffset);
  let node = walker.nextNode();

  while (node) {
    const text = node.textContent || '';
    const nodeCodePointLength = codePointLength(text);
    if (remaining <= nodeCodePointLength) {
      return {
        node,
        offset: codePointToCodeUnitIndex(text, remaining),
      };
    }
    remaining -= nodeCodePointLength;
    node = walker.nextNode();
  }

  return {
    node: editor,
    offset: editor.childNodes.length,
  };
};

const setSelectionOffsetsInEditor = (editor, start, end = start) => {
  const selection = window.getSelection();
  if (!selection) return;

  const normalizedStart = Math.max(0, start);
  const normalizedEnd = Math.max(normalizedStart, end);
  const startPos = resolveEditorPositionByOffset(editor, normalizedStart);
  const endPos = resolveEditorPositionByOffset(editor, normalizedEnd);

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  selection.removeAllRanges();
  selection.addRange(range);
};

const renderBioEditor = ({ preserveSelection = false } = {}) => {
  const editor = bioEditorRef.value;
  if (!editor) return;

  const selectionOffsets = preserveSelection ? getSelectionOffsetsInEditor(editor) : null;
  const safeText = bioSafeText.value;
  const overflowText = bioOverflowText.value;

  editor.replaceChildren();

  if (safeText) {
    editor.appendChild(document.createTextNode(safeText));
  }

  if (overflowText) {
    const overflowSpan = document.createElement('span');
    overflowSpan.className = 'v-profile-edit-bio-overflow';
    overflowSpan.textContent = overflowText;
    editor.appendChild(overflowSpan);
  }

  if (!selectionOffsets) return;

  const maxOffset = bioLength.value;
  setSelectionOffsetsInEditor(
    editor,
    Math.min(selectionOffsets.start, maxOffset),
    Math.min(selectionOffsets.end, maxOffset),
  );
};

const syncBioFromEditor = ({ preserveSelection = true } = {}) => {
  const editor = bioEditorRef.value;
  if (!editor) return;
  form.value.bio = normalizeBioText(editor.innerText);
  renderBioEditor({ preserveSelection });
};

const onBioInput = () => {
  if (isBioComposing.value) {
    const editor = bioEditorRef.value;
    if (!editor) return;
    form.value.bio = normalizeBioText(editor.innerText);
    return;
  }
  syncBioFromEditor({ preserveSelection: true });
};

const onBioBlur = () => {
  syncBioFromEditor({ preserveSelection: false });
};

const onBioCompositionStart = () => {
  isBioComposing.value = true;
};

const onBioCompositionEnd = () => {
  isBioComposing.value = false;
  syncBioFromEditor({ preserveSelection: true });
};

const insertPlainTextAtCursor = (text) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  selection.deleteFromDocument();
  const range = selection.getRangeAt(0);
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const onBioPaste = (event) => {
  event.preventDefault();
  const text = normalizeBioText(event.clipboardData?.getData('text/plain') || '');
  insertPlainTextAtCursor(text);
  syncBioFromEditor({ preserveSelection: true });
};

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
const defaultHours = () => DAY_ORDER.map((day) => ({
  dayOfWeek: day,
  openTime: '06:00',
  closeTime: '23:00',
  isClosed: false,
}));

const gymForm = ref({
  name: '',
  address: '',
  description: '',
  categoryId: null,
  categoryName: '',
  tel: '',
});
const gymCategoryOptions = ref([]);
const isLoadingGymCategories = ref(false);
const gymHours = ref(defaultHours());
const availableAmenities = [
  { code: 'FREE_WIFI', label: '무료 Wi-Fi' },
  { code: 'SHOWER', label: '샤워실' },
  { code: 'PARKING', label: '주차 가능' },
  { code: 'PERSONAL_TRAINING', label: 'PT 가능' },
  { code: 'LOCKER', label: '락커' },
  { code: 'INBODY', label: '인바디' },
  { code: 'LAUNDRY', label: '세탁실' },
];
const selectedAmenities = ref([]);
const products = ref([{ productName: '', price: 0 }]);
const exceptions = ref([]);
const exceptionForm = ref({
  specificDate: '',
  openTime: '09:00',
  closeTime: '18:00',
  isClosed: false,
  description: '',
});
const gymImages = ref([]);
const pendingImages = ref([]);
const selectedImageNames = ref([]);
const gymImageInputRef = ref(null);
const isAddressSearchModalOpen = ref(false);
const isSearchingAddress = ref(false);
const addressSearchQuery = ref('');
const addressSearchResult = ref(null);
const addressSearchError = ref('');

const isSavingGymProfile = ref(false);
const isSavingGymHours = ref(false);
const isSavingAmenities = ref(false);
const isSavingProducts = ref(false);
const isCreatingException = ref(false);
const isUploadingImages = ref(false);
const isDeletingImage = ref(false);
const isCreatingReservation = ref(false);
const isProcessingAccountAction = ref(false);
const gymId = ref(null);
const reservationForm = ref({
  date: '',
  slotName: '1:1 PT 수업',
  price: 50000,
  maxCapacity: 1,
});

const toHHmm = (value, fallback = '00:00') => {
  if (!value) return fallback;
  return String(value).slice(0, 5);
};

const toHHmmss = (value, fallback = '00:00:00') => {
  if (!value) return fallback;
  const time = String(value).slice(0, 8);
  if (time.length === 5) return `${time}:00`;
  if (time.length === 8) return time;
  return fallback;
};

const formatTime = (value) => toHHmm(value, '--:--');

const normalizeCategoryOption = (item = {}) => ({
  id: Number(item?.id ?? 0),
  name: String(item?.name || '').trim(),
  sortOrder: Number(item?.sortOrder ?? 999),
});

const syncGymCategorySelection = () => {
  if (!gymCategoryOptions.value.length) return;

  const matchedById = gymCategoryOptions.value.find((category) => category.id === Number(gymForm.value.categoryId));
  if (matchedById) {
    gymForm.value.categoryName = matchedById.name;
    return;
  }

  const currentCategoryName = String(gymForm.value.categoryName || '').trim();
  if (!currentCategoryName) return;

  const matchedByName = gymCategoryOptions.value.find((category) => category.name === currentCategoryName);
  if (matchedByName) {
    gymForm.value.categoryId = matchedByName.id;
    gymForm.value.categoryName = matchedByName.name;
  }
};

const applyGymData = (payload = {}) => {
  gymForm.value.name = payload.name || '';
  gymForm.value.address = payload.address || '';
  gymForm.value.description = payload.description || '';
  const categoryId = Number(payload.categoryId ?? payload.category?.id ?? 0);
  gymForm.value.categoryId = Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null;
  gymForm.value.categoryName = String(payload.categoryName || payload.category?.name || '').trim();
  gymForm.value.tel = payload.tel || payload.phone || '';

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
    gymHours.value = merged;
  }

  const amenityList = payload.amenities || payload.amenityCodes || [];
  selectedAmenities.value = Array.isArray(amenityList)
    ? amenityList.map((a) => (typeof a === 'object' && a !== null ? a.code || a.amenityCode || a.name : a))
    : [];

  const productList = payload.products || [];
  products.value = Array.isArray(productList) && productList.length > 0
    ? productList.map((item) => ({
      productName: item.productName || item.name || '',
      price: Number(item.price || 0),
    }))
    : [{ productName: '', price: 0 }];

  const rawImages = payload.images || payload.imageList || payload.gymImages || [];
  gymImages.value = Array.isArray(rawImages)
    ? rawImages
      .map((item, index) => {
        const id = item?.imageId ?? item?.id ?? null;
        const url = item?.imageUrl || item?.url || item?.path || item?.src || '';
        if (!url) return null;
        return { id, url, key: `${id ?? 'no-id'}-${index}` };
      })
      .filter(Boolean)
    : [];

  syncGymCategorySelection();
};

const loadGymCategories = async () => {
  isLoadingGymCategories.value = true;
  try {
    const response = await mapApi.categories();
    const payload = extractPayload(response, []);
    const list = extractList(payload)
      .map(normalizeCategoryOption)
      .filter((category) => category.id > 0 && category.name)
      .sort((left, right) => left.sortOrder - right.sortOrder);
    gymCategoryOptions.value = list;
    syncGymCategorySelection();
  } catch (error) {
    gymCategoryOptions.value = [];
  } finally {
    isLoadingGymCategories.value = false;
  }
};

const handleGymCategoryChange = (event) => {
  const rawValue = String(event?.target?.value || '').trim();
  const nextId = Number(rawValue);

  if (!Number.isFinite(nextId) || nextId <= 0) {
    gymForm.value.categoryId = null;
    gymForm.value.categoryName = '';
    return;
  }

  const selectedCategory = gymCategoryOptions.value.find((category) => category.id === nextId);
  gymForm.value.categoryId = nextId;
  gymForm.value.categoryName = selectedCategory?.name || '';
};

const openAddressSearchModal = () => {
  addressSearchQuery.value = String(gymForm.value.address || '').trim();
  addressSearchResult.value = null;
  addressSearchError.value = '';
  isAddressSearchModalOpen.value = true;
};

const closeAddressSearchModal = () => {
  if (isSearchingAddress.value) return;
  isAddressSearchModalOpen.value = false;
  addressSearchError.value = '';
  addressSearchResult.value = null;
};

const searchAddress = async () => {
  const query = String(addressSearchQuery.value || '').trim();
  if (!query) {
    addressSearchError.value = '검색할 주소를 입력해주세요.';
    addressSearchResult.value = null;
    return;
  }

  isSearchingAddress.value = true;
  addressSearchError.value = '';
  addressSearchResult.value = null;
  try {
    const response = await mapApi.geocode(query);
    const payload = extractPayload(response, {});
    const roadAddress = String(payload?.roadAddress || '').trim();
    const jibunAddress = String(payload?.jibunAddress || '').trim();

    if (!roadAddress && !jibunAddress) {
      addressSearchError.value = '검색 결과가 없습니다.';
      return;
    }

    addressSearchResult.value = {
      roadAddress,
      jibunAddress,
    };
  } catch (error) {
    addressSearchError.value = String(
      error?.response?.data?.message
      || error?.response?.data?.error
      || '주소 검색에 실패했습니다.',
    ).trim();
  } finally {
    isSearchingAddress.value = false;
  }
};

const applySearchedAddress = () => {
  const nextAddress = String(
    addressSearchResult.value?.roadAddress
    || addressSearchResult.value?.jibunAddress
    || '',
  ).trim();

  if (!nextAddress) return;

  gymForm.value.address = nextAddress;
  isAddressSearchModalOpen.value = false;
  addressSearchError.value = '';
  addressSearchResult.value = null;
};

const toFriendlyEmailVerifyError = (error, fallbackMessage) => {
  const serverMessage = String(
    error?.response?.data?.message
      || error?.response?.data?.error
      || error?.response?.data?.result
      || '',
  ).trim();
  return serverMessage || fallbackMessage;
};

const resetEmailVerificationState = () => {
  verifiedEmail.value = '';
  emailVerificationCode.value = '';
  isEmailCodeSent.value = false;
  emailVerifyMessage.value = '';
  emailVerifyError.value = '';
};

const sendEmailVerificationCode = async () => {
  const email = normalizedCurrentEmail.value;
  if (!email) {
    emailVerifyError.value = '이메일을 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }
  if (!isEmailChangeRequested.value) {
    emailVerifyError.value = '변경할 이메일을 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }

  isSendingEmailCode.value = true;
  emailVerifyError.value = '';
  emailVerifyMessage.value = '';
  verifiedEmail.value = '';
  try {
    await userApi.sendEmailVerification({ email });
    isEmailCodeSent.value = true;
    emailVerificationCode.value = '';
    emailVerifyMessage.value = '인증코드를 전송했습니다. 이메일을 확인해주세요.';
  } catch (error) {
    emailVerifyError.value = toFriendlyEmailVerifyError(error, '인증코드 전송에 실패했습니다.');
  } finally {
    isSendingEmailCode.value = false;
  }
};

const verifyEmailCode = async () => {
  const email = normalizedCurrentEmail.value;
  const code = String(emailVerificationCode.value || '').trim();
  if (!email) {
    emailVerifyError.value = '이메일을 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }
  if (!code) {
    emailVerifyError.value = '인증코드를 입력해주세요.';
    emailVerifyMessage.value = '';
    return;
  }

  isVerifyingEmailCode.value = true;
  emailVerifyError.value = '';
  emailVerifyMessage.value = '';
  try {
    await userApi.verifyEmailCode({ email, code });
    verifiedEmail.value = email;
    emailVerifyMessage.value = '인증 완료되었습니다.';
  } catch (error) {
    emailVerifyError.value = toFriendlyEmailVerifyError(error, '이메일 인증에 실패했습니다.');
  } finally {
    isVerifyingEmailCode.value = false;
  }
};

const extractProfileSaveErrorMessage = (error) => {
  const serverMessage = String(
    error?.response?.data?.error_message
      || error?.response?.data?.message
      || error?.response?.data?.error
      || '',
  ).trim();

  if (serverMessage) return serverMessage;
  if (!error?.response) return '백엔드 연결에 실패했습니다. API 주소/CORS 설정을 확인해주세요.';
  return '프로필 수정 중 오류가 발생했습니다.';
};

const normalizeBearerToken = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.replace(/^Bearer\s+/i, '').trim();
};

const openProfileSaveModal = ({ tone = 'success', title = '', message = '', detail = '', redirectToProfile = false } = {}) => {
  profileSaveModal.value = {
    open: true,
    tone,
    title,
    message,
    detail,
    redirectToProfile,
  };
};

const extractOwnerActionErrorMessage = (error, fallback = '잠시 후 다시 시도해주세요.') => String(
  error?.response?.data?.message
  || error?.response?.data?.error_message
  || error?.response?.data?.error
  || fallback
).trim();

const openOwnerActionModal = ({ tone = 'success', title = '', message = '', detail = '' } = {}) => {
  openProfileSaveModal({
    tone,
    title,
    message,
    detail,
    redirectToProfile: false,
  });
};

const handleProfileSaveModalConfirm = () => {
  const shouldRedirect = Boolean(profileSaveModal.value.redirectToProfile);
  profileSaveModal.value = {
    open: false,
    tone: 'success',
    title: '',
    message: '',
    detail: '',
    redirectToProfile: false,
  };
  if (shouldRedirect) {
    router.push(profileLink.value);
  }
};

const loadProfile = async () => {
  try {
    const response = await userApi.myInfo();
    const data = extractPayload(response);
    loadedProfileRole.value = normalizeRole(data.role);
    form.value.userName = data.userName || data.name || data.displayName || '';
    form.value.nickName = data.nickName || data.nickname || '';
    form.value.email = data.email || '';
    originalEmail.value = String(data.email || '').trim().toLowerCase();
    verifiedEmail.value = originalEmail.value;
    form.value.bio = String(data.bio ?? '');
    form.value.profileImage = resolveUserAvatar(data.profileImageUrl || data.profileImage);
    form.value.isPublic = typeof data.isPublic === 'boolean' ? data.isPublic : true;
    form.value.showStats = typeof data.showStats === 'boolean' ? data.showStats : true;
  } catch (error) {
    console.error('Failed to load profile edit data:', error);
  }
  await nextTick();
  renderBioEditor();
};

const initializeProfileEditView = async () => {
  primeSessionFromToken();
  try {
    await syncSessionFromServer({ force: true });
  } catch (error) {
    // preview mode fallback
  }

  if (previewRole.value === 'GYM_OWNER' || normalizeRole(sessionProfile.value?.role) === 'GYM_OWNER') {
    await Promise.all([loadGymCategories(), loadGym()]);
    return;
  }

  await loadProfile();
  if (isGymOwner.value) {
    await Promise.all([loadGymCategories(), loadGym()]);
  }
};

const openProfileImagePicker = () => {
  if (profileImageInputRef.value) {
    profileImageInputRef.value.value = '';
  }
  profileImageInputRef.value?.click();
};

const onProfileImageChange = (event) => {
  const file = event?.target?.files?.[0];
  if (!file) return;
  if (profileImagePreviewUrl.value) {
    URL.revokeObjectURL(profileImagePreviewUrl.value);
  }
  const previewUrl = URL.createObjectURL(file);
  profileImagePreviewUrl.value = previewUrl;
  profileImageFile.value = file;
  form.value.profileImage = previewUrl;
};

watch(
  () => normalizedCurrentEmail.value,
  (next, prev) => {
    if (next === prev) return;
    emailVerifyError.value = '';

    if (next !== verifiedEmail.value) {
      resetEmailVerificationState();
      if (next && next === normalizedOriginalEmail.value) {
        verifiedEmail.value = normalizedOriginalEmail.value;
      }
    }
  },
);

const saveProfile = async () => {
  syncBioFromEditor({ preserveSelection: false });
  if (isBioOverLimit.value || isSavingProfile.value) return;
  if (isEmailChangeRequested.value && !isEmailChangeVerifiedForCurrent.value) {
    emailVerifyError.value = '이메일 변경 시 인증을 완료해주세요.';
    emailVerifyMessage.value = '';
    return;
  }

  isSavingProfile.value = true;
  try {
    const response = await userApi.update({
      userName: form.value.userName,
      nickName: form.value.nickName,
      email: form.value.email,
      bio: String(form.value.bio || ''),
      isPublic: form.value.isPublic,
      showStats: form.value.showStats,
      profileImage: profileImageFile.value || undefined,
    });

    const accessToken = normalizeBearerToken(response?.headers?.authorization);
    const refreshToken = String(response?.headers?.['x-refresh-token'] || '').trim();
    if (accessToken || refreshToken) {
      setAuthTokens({ accessToken, refreshToken });
    }

    openProfileSaveModal({
      tone: 'success',
      title: '프로필 수정 완료',
      message: '수정되었습니다.',
      redirectToProfile: true,
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    openProfileSaveModal({
      tone: 'error',
      title: '프로필 수정 실패',
      message: '프로필을 수정하지 못했습니다.',
      detail: extractProfileSaveErrorMessage(error),
      redirectToProfile: false,
    });
  } finally {
    isSavingProfile.value = false;
  }
};

const openDeleteAccountModal = () => {
  if (isProcessingAccountAction.value) return;
  deleteAccountError.value = '';
  isDeleteAccountModalOpen.value = true;
};

const closeDeleteAccountModal = () => {
  if (isProcessingAccountAction.value) return;
  deleteAccountError.value = '';
  isDeleteAccountModalOpen.value = false;
};

const deleteAccount = async () => {
  if (isProcessingAccountAction.value) return;

  isProcessingAccountAction.value = true;
  deleteAccountError.value = '';
  try {
    await userApi.delete();
    isDeleteAccountModalOpen.value = false;
    notifyAuthInvalidated({ reason: 'account_deleted' });
    router.push('/');
  } catch (error) {
    deleteAccountError.value = '회원탈퇴에 실패했습니다.';
    isProcessingAccountAction.value = false;
  }
};

const loadExceptions = async () => {
  try {
    const response = await gymApi.listException();
    const payload = extractPayload(response);
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.list)
          ? payload.list
          : [];
    exceptions.value = list.map((item) => ({
      ...item,
      isClosed: Boolean(item?.isClosed ?? item?.closed),
    }));
  } catch (error) {
    exceptions.value = [];
  }
};

const loadGym = async () => {
  try {
    const response = await gymApi.myGym();
    const payload = extractPayload(response);
    gymId.value = payload.id || payload.gymId || null;
    applyGymData(payload);
    await loadExceptions();
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '짐 정보 불러오기 실패',
      message: '짐 정보를 불러오지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error, '새로고침 후 다시 시도해주세요.'),
    });
  }
};

const saveGymProfile = async () => {
  if (!gymForm.value.categoryId) {
    openProfileSaveModal({
      tone: 'error',
      title: '기본 정보 저장 실패',
      message: '짐 기본 정보를 저장하지 못했습니다.',
      detail: '카테고리를 선택해주세요.',
      redirectToProfile: false,
    });
    return;
  }
  if (isGymDescriptionOverLimit.value) {
    openProfileSaveModal({
      tone: 'error',
      title: '기본 정보 저장 실패',
      message: '짐 기본 정보를 저장하지 못했습니다.',
      detail: `소개는 최대 ${PROFILE_BIO_MAX_LENGTH}자까지 입력할 수 있습니다.`,
      redirectToProfile: false,
    });
    return;
  }

  isSavingGymProfile.value = true;
  try {
    await gymApi.updateProfile({
      name: gymForm.value.name,
      address: gymForm.value.address,
      description: gymForm.value.description,
      categoryId: Number(gymForm.value.categoryId || 1),
      tel: gymForm.value.tel,
    });
    openProfileSaveModal({
      tone: 'success',
      title: '기본 정보 저장 완료',
      message: '짐 기본 정보가 저장되었습니다.',
      redirectToProfile: false,
    });
  } catch (error) {
    openProfileSaveModal({
      tone: 'error',
      title: '기본 정보 저장 실패',
      message: '짐 기본 정보를 저장하지 못했습니다.',
      detail: String(
        error?.response?.data?.message
        || error?.response?.data?.error_message
        || error?.response?.data?.error
        || '잠시 후 다시 시도해주세요.'
      ).trim(),
      redirectToProfile: false,
    });
  } finally {
    isSavingGymProfile.value = false;
  }
};

const createDailySlots = async () => {
  if (!gymId.value) {
    openOwnerActionModal({
      tone: 'error',
      title: '예약 슬롯 생성 실패',
      message: '예약 슬롯을 생성하지 못했습니다.',
      detail: '짐 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.',
    });
    return;
  }
  if (!reservationForm.value.date) {
    openOwnerActionModal({
      tone: 'error',
      title: '예약 슬롯 생성 실패',
      message: '예약 슬롯을 생성하지 못했습니다.',
      detail: '예약 슬롯을 생성할 날짜를 선택해주세요.',
    });
    return;
  }
  if (reservationForm.value.price < 0) {
    openOwnerActionModal({
      tone: 'error',
      title: '예약 슬롯 생성 실패',
      message: '예약 슬롯을 생성하지 못했습니다.',
      detail: '가격은 0원 이상이어야 합니다.',
    });
    return;
  }
  if (reservationForm.value.maxCapacity < 1) {
    openOwnerActionModal({
      tone: 'error',
      title: '예약 슬롯 생성 실패',
      message: '예약 슬롯을 생성하지 못했습니다.',
      detail: '정원은 1명 이상이어야 합니다.',
    });
    return;
  }

  isCreatingReservation.value = true;

  try {
    await reservationApi.createDailySlots(gymId.value, {
      date: reservationForm.value.date,
      slotName: reservationForm.value.slotName,
      price: reservationForm.value.price,
      maxCapacity: reservationForm.value.maxCapacity,
    });
    openOwnerActionModal({
      tone: 'success',
      title: '예약 슬롯 생성 완료',
      message: `${reservationForm.value.date} 예약 슬롯이 성공적으로 생성되었습니다.`,
    });
    
    reservationForm.value.date = '';
    reservationForm.value.slotName = '1:1 PT 수업';
    reservationForm.value.price = 50000;
    reservationForm.value.maxCapacity = 1;
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '예약 슬롯 생성 실패',
      message: '예약 슬롯을 생성하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error, '영업시간이 설정되어 있는지 확인해주세요.'),
    });
  } finally {
    isCreatingReservation.value = false;
  }
};

const saveGymHours = async () => {
  isSavingGymHours.value = true;
  try {
    await gymApi.replaceHours(gymHours.value.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      openTime: toHHmmss(item.openTime, '06:00:00'),
      closeTime: toHHmmss(item.closeTime, '23:00:00'),
      closed: Boolean(item.isClosed),
    })));
    openOwnerActionModal({
      tone: 'success',
      title: '영업 시간 저장 완료',
      message: '영업 시간이 저장되었습니다.',
    });
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '영업 시간 저장 실패',
      message: '영업 시간을 저장하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error),
    });
  } finally {
    isSavingGymHours.value = false;
  }
};

const saveAmenities = async () => {
  isSavingAmenities.value = true;
  try {
    await gymApi.replaceAmenities(selectedAmenities.value);
    openOwnerActionModal({
      tone: 'success',
      title: '편의시설 저장 완료',
      message: '편의시설이 저장되었습니다.',
    });
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '편의시설 저장 실패',
      message: '편의시설을 저장하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error),
    });
  } finally {
    isSavingAmenities.value = false;
  }
};

const addProduct = () => {
  products.value.push({ productName: '', price: 0 });
};

const handleProductPriceInput = (index, event) => {
  const digitsOnly = String(event?.target?.value || '').replace(/[^\d]/g, '');
  products.value[index].price = digitsOnly ? Number(digitsOnly) : 0;
};

const removeProduct = (index) => {
  products.value = products.value.filter((_, idx) => idx !== index);
};

const saveProducts = async () => {
  isSavingProducts.value = true;
  try {
    const payload = products.value
      .filter((item) => item.productName)
      .map((item) => ({
        productName: item.productName,
        price: Number(item.price || 0),
      }));
    await gymApi.replaceProducts(payload);
    openOwnerActionModal({
      tone: 'success',
      title: '상품 저장 완료',
      message: '상품 정보가 저장되었습니다.',
    });
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '상품 저장 실패',
      message: '상품 정보를 저장하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error),
    });
  } finally {
    isSavingProducts.value = false;
  }
};

const createException = async () => {
  if (!exceptionForm.value.specificDate) {
    openOwnerActionModal({
      tone: 'error',
      title: '예외 운영시간 추가 실패',
      message: '예외 운영시간을 추가하지 못했습니다.',
      detail: '예외 날짜를 선택해주세요.',
    });
    return;
  }

  isCreatingException.value = true;
  try {
    const openTime = exceptionForm.value.isClosed ? null : toHHmmss(exceptionForm.value.openTime, '09:00:00');
    const closeTime = exceptionForm.value.isClosed ? null : toHHmmss(exceptionForm.value.closeTime, '18:00:00');

    await gymApi.createException({
      specificDate: exceptionForm.value.specificDate,
      openTime,
      closeTime,
      closed: exceptionForm.value.isClosed,
      description: exceptionForm.value.description || null,
    });
    exceptionForm.value.specificDate = '';
    exceptionForm.value.description = '';
    await loadExceptions();
    openOwnerActionModal({
      tone: 'success',
      title: '예외 운영시간 추가 완료',
      message: '예외 운영시간이 추가되었습니다.',
    });
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '예외 운영시간 추가 실패',
      message: '예외 운영시간을 추가하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error),
    });
  } finally {
    isCreatingException.value = false;
  }
};

const deleteException = async (id) => {
  if (!window.confirm('해당 예외 시간을 삭제할까요?')) return;
  try {
    await gymApi.deleteException(id);
    await loadExceptions();
    openOwnerActionModal({
      tone: 'success',
      title: '예외 운영시간 삭제 완료',
      message: '예외 운영시간이 삭제되었습니다.',
    });
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '예외 운영시간 삭제 실패',
      message: '예외 운영시간을 삭제하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error),
    });
  }
};

const handleImageChange = (event) => {
  const files = Array.from(event?.target?.files || []);
  pendingImages.value = files;
  selectedImageNames.value = files.map((file) => file.name);
};

const openGymImagePicker = () => {
  if (gymImageInputRef.value) {
    gymImageInputRef.value.value = '';
  }
  gymImageInputRef.value?.click();
};

const handleGymImageAction = () => {
  if (pendingImages.value.length > 0) {
    uploadImages();
    return;
  }
  openGymImagePicker();
};

const uploadImages = async () => {
  if (pendingImages.value.length === 0) return;
  isUploadingImages.value = true;
  try {
    await gymApi.addImages(pendingImages.value);
    pendingImages.value = [];
    selectedImageNames.value = [];
    if (gymImageInputRef.value) {
      gymImageInputRef.value.value = '';
    }
    await loadGym();
    openOwnerActionModal({
      tone: 'success',
      title: '짐 이미지 업로드 완료',
      message: '짐 이미지가 업로드되었습니다.',
    });
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '짐 이미지 업로드 실패',
      message: '짐 이미지를 업로드하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error),
    });
  } finally {
    isUploadingImages.value = false;
  }
};

const deleteImage = async (image) => {
  if (!image?.id) return;
  if (!window.confirm('해당 이미지를 삭제할까요?')) return;
  isDeletingImage.value = true;
  try {
    await gymApi.deleteImage(image.id);
    await loadGym();
    openOwnerActionModal({
      tone: 'success',
      title: '짐 이미지 삭제 완료',
      message: '짐 이미지가 삭제되었습니다.',
    });
  } catch (error) {
    openOwnerActionModal({
      tone: 'error',
      title: '짐 이미지 삭제 실패',
      message: '짐 이미지를 삭제하지 못했습니다.',
      detail: extractOwnerActionErrorMessage(error),
    });
  } finally {
    isDeletingImage.value = false;
  }
};

onMounted(async () => {
  await initializeProfileEditView();
});
</script>

<style scoped>
.u-hidden {
  display: none;
}

.v-profile-email-verify-wrap {
  display: grid;
  gap: 8px;
}

.v-profile-email-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  gap: 8px;
}

.v-profile-email-btn {
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  min-height: 44px;
  padding: 0 8px;
}

.v-profile-email-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.v-profile-email-btn-verify {
  border-color: #93c5fd;
  background: #dbeafe;
}

.v-profile-email-msg {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.v-profile-email-msg-success {
  color: #16a34a;
}

.v-profile-email-msg-error {
  color: #dc2626;
}

.v-profile-edit-input-left {
  text-align: left;
  padding-left: 14px;
}

.owner-edit-page {
  display: grid;
  gap: 14px;
}

.owner-edit-section {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  gap: 10px;
}

.owner-edit-section h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.owner-edit-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.owner-edit-field {
  display: grid;
  gap: 6px;
}

.owner-edit-field span {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.owner-edit-address-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.owner-edit-address-input {
  cursor: default;
}

.owner-edit-address-btn {
  min-width: 96px;
}

.owner-edit-select {
  appearance: auto;
}

.owner-edit-textarea {
  min-height: 96px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.owner-edit-hours {
  display: grid;
  gap: 8px;
}

.owner-edit-hour-row {
  display: grid;
  grid-template-columns: 36px auto 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.owner-edit-hour-day {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.owner-edit-hour-closed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
}

.owner-edit-row-gap {
  display: grid;
  gap: 8px;
}

.owner-edit-product-row {
  display: grid;
  grid-template-columns: 1fr 130px 70px;
  gap: 8px;
  align-items: center;
}

.owner-edit-product-price-input::-webkit-outer-spin-button,
.owner-edit-product-price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.owner-edit-product-price-input {
  -moz-appearance: textfield;
}

.owner-edit-small-btn {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  min-height: 40px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.owner-edit-inline-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.owner-edit-action-btn {
  min-height: 44px;
}

.owner-edit-date-filter {
  width: 100%;
  min-width: 0;
}

.owner-edit-date-input {
  width: 100%;
}

.owner-edit-image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.owner-edit-image-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 8px;
  display: grid;
  gap: 8px;
}

.owner-edit-image-thumb {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 8px;
}

.owner-edit-exception-row {
  display: grid;
  grid-template-columns: 1fr 70px;
  gap: 8px;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
}

.owner-edit-date {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.owner-edit-help {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.owner-edit-message {
  margin: 0;
  font-size: 13px;
  color: #166534;
}

.owner-edit-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}

.owner-edit-address-modal {
  width: min(520px, 100%);
  border-radius: 24px;
}

.owner-edit-address-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  margin-top: 16px;
  align-items: center;
}

.owner-edit-address-search-submit {
  min-width: 72px;
  min-height: 44px;
  padding: 0 14px;
  flex-shrink: 0;
}

.owner-edit-address-result {
  margin-top: 16px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: #eff6ff;
  padding: 14px;
  display: grid;
  gap: 6px;
}

.owner-edit-address-result strong {
  color: #1e3a8a;
  font-size: 14px;
}

.owner-edit-address-result p {
  margin: 0;
  color: #475569;
  font-size: 13px;
}

.owner-edit-address-modal-actions {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.settings-amenities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 16px;
  background-color: #f1f5f9;
  border-radius: 12px;
  margin-bottom: 12px;
}

.settings-checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
  user-select: none;
}

.settings-checkbox-field input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2563eb;
}

.v-profile-edit-account-bottom {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.v-profile-delete-link {
  border: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  padding: 4px 2px;
}

.v-profile-delete-link:hover {
  color: #64748b;
  text-decoration: underline;
}

.v-profile-delete-link:disabled {
  opacity: 0.6;
  cursor: default;
  text-decoration: none;
}

.v-profile-save-modal-backdrop {
  padding: 20px;
}

.v-profile-save-modal {
  width: min(420px, 100%);
  border-radius: 24px;
}

.v-profile-save-modal-body {
  padding: 24px 24px 16px;
}

.v-profile-save-modal-copy {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
}

.v-profile-save-modal-detail {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
}

.v-profile-save-modal-detail-error {
  color: #dc2626;
}

.v-profile-save-modal-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  padding: 0 24px 24px;
}

.v-profile-save-modal-confirm {
  width: 100%;
}

.v-profile-delete-modal-backdrop {
  padding: 20px;
}

.v-profile-delete-modal {
  width: min(420px, 100%);
  border-radius: 24px;
}

.v-profile-delete-modal-body {
  padding: 24px 24px 16px;
}

.v-profile-delete-modal-copy {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
}

.v-profile-delete-modal-copy-muted {
  margin-top: 6px;
  color: #64748b;
}

.v-profile-delete-modal-error {
  margin: 14px 0 0;
  font-size: 13px;
  color: #dc2626;
}

.v-profile-delete-modal-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0 24px 24px;
}

.v-profile-delete-modal-confirm {
  background: #dc2626;
}

.v-profile-delete-modal-confirm:hover {
  background: #b91c1c;
}

@media (min-width: 900px) {
  .owner-edit-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .owner-edit-image-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .owner-edit-address-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .owner-edit-address-btn {
    width: 100%;
  }

  .owner-edit-address-search-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }

  .owner-edit-address-search-submit {
    width: auto;
    min-width: 64px;
    padding: 0 12px;
    font-size: 13px;
  }

  .v-profile-save-modal-body {
    padding: 20px 18px 14px;
  }

  .v-profile-save-modal-actions {
    padding: 0 18px 18px;
  }

  .v-profile-delete-modal-body {
    padding: 20px 18px 14px;
  }

  .v-profile-delete-modal-actions {
    padding: 0 18px 18px;
  }
}
</style>
