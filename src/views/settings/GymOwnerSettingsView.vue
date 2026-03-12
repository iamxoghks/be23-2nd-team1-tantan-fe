<template>
  <div class="app-screen app-screen-slate">
    <NavigationRail />

    <div class="app-main-column">
      <div class="view-wrap view-wrap-lg">
        <div class="view-card settings-page">
          <div class="settings-head">
            <h1>짐 운영 설정</h1>
            <p>짐 기본 정보, 영업시간, 예외 일정, 운영 계정을 관리합니다.</p>
          </div>

          <section class="settings-section">
            <h2>짐 기본 정보</h2>
            <div class="settings-grid-2">
              <label class="settings-field">
                <span>짐 이름</span>
                <input v-model="gymProfile.name" type="text" />
              </label>
              <label class="settings-field">
                <span>전화번호</span>
                <input v-model="gymProfile.tel" type="text" />
              </label>
            </div>
            <label class="settings-field">
              <span>주소</span>
              <input v-model="gymProfile.address" type="text" />
            </label>
            <label class="settings-field">
              <span>카테고리 ID</span>
              <input v-model.number="gymProfile.categoryId" type="number" min="1" />
            </label>
            <label class="settings-field">
              <span>소개</span>
              <textarea v-model="gymProfile.description" rows="4" />
            </label>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isSavingProfile" @click="saveGymProfile">
              {{ isSavingProfile ? '저장 중...' : '기본 정보 저장' }}
            </button>
          </section>

          <section class="settings-section">
            <h2>영업 시간</h2>
            <div class="settings-hours-grid">
              <div v-for="hour in hours" :key="hour.dayOfWeek" class="settings-hour-row">
                <div class="settings-hour-day">{{ dayLabelMap[hour.dayOfWeek] }}</div>
                <label class="settings-hour-checkbox">
                  <input v-model="hour.isClosed" type="checkbox" />
                  휴무
                </label>
                <input v-model="hour.openTime" type="time" :disabled="hour.isClosed" />
                <span>~</span>
                <input v-model="hour.closeTime" type="time" :disabled="hour.isClosed" />
              </div>
            </div>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isSavingHours" @click="saveHours">
              {{ isSavingHours ? '저장 중...' : '영업 시간 저장' }}
            </button>
          </section>

          <section class="settings-section">
            <h2>편의시설</h2>
            <div class="settings-amenities-grid">
              <label v-for="amenity in availableAmenities" :key="amenity.code" class="settings-checkbox-field">
                <input type="checkbox" :value="amenity.code" v-model="selectedAmenities" />
                <span>{{ amenity.label }}</span>
              </label>
            </div>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isSavingAmenities" @click="saveAmenities">
              {{ isSavingAmenities ? '저장 중...' : '편의시설 저장' }}
            </button>
          </section>

          <section class="settings-section">
            <h2>상품</h2>
            <div class="settings-row-gap">
              <div v-for="(product, idx) in products" :key="idx" class="settings-product-row">
                <input v-model="product.productName" type="text" placeholder="상품명" />
                <input v-model.number="product.price" type="number" min="0" placeholder="가격" />
                <button class="settings-small-btn" @click="removeProduct(idx)">삭제</button>
              </div>
            </div>
            <div class="settings-inline-actions">
              <button class="v-modal-cancel-btn settings-small-action" @click="addProduct">상품 추가</button>
              <button class="v-modal-save-btn settings-small-action" :disabled="isSavingProducts" @click="saveProducts">
                {{ isSavingProducts ? '저장 중...' : '상품 저장' }}
              </button>
            </div>
          </section>

          <section class="settings-section">
            <h2>예외 운영시간</h2>
            <div class="settings-grid-2">
              <label class="settings-field">
                <span>날짜</span>
                <input v-model="exceptionForm.specificDate" type="date" />
              </label>
              <label class="settings-field">
                <span>휴무 여부</span>
                <input v-model="exceptionForm.isClosed" type="checkbox" />
              </label>
            </div>
            <div class="settings-grid-2">
              <label class="settings-field">
                <span>오픈 시간</span>
                <input v-model="exceptionForm.openTime" type="time" :disabled="exceptionForm.isClosed" />
              </label>
              <label class="settings-field">
                <span>마감 시간</span>
                <input v-model="exceptionForm.closeTime" type="time" :disabled="exceptionForm.isClosed" />
              </label>
            </div>
            <label class="settings-field">
              <span>사유</span>
              <input v-model="exceptionForm.description" type="text" />
            </label>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isCreatingException" @click="createException">
              {{ isCreatingException ? '추가 중...' : '예외 시간 추가' }}
            </button>

            <div class="settings-row-gap">
              <div v-for="item in exceptions" :key="item.id" class="settings-exception-row">
                <div>
                  <p class="settings-label">{{ item.specificDate || item.date }}</p>
                  <p class="settings-help">
                    {{ item.isClosed ? '휴무' : `${formatTime(item.openTime)} ~ ${formatTime(item.closeTime)}` }}
                    <template v-if="item.description"> · {{ item.description }}</template>
                  </p>
                </div>
                <button class="settings-small-btn" @click="deleteException(item.id)">삭제</button>
              </div>
            </div>
          </section>

          <section class="settings-section">
            <h2>계정 보안</h2>
            <div class="settings-grid-3">
              <label class="settings-field">
                <span>현재 비밀번호</span>
                <input v-model="passwordForm.currentPassword" type="password" />
              </label>
              <label class="settings-field">
                <span>새 비밀번호</span>
                <input v-model="passwordForm.newPassword" type="password" />
              </label>
              <label class="settings-field">
                <span>새 비밀번호 확인</span>
                <input v-model="passwordForm.newPasswordConfirm" type="password" />
              </label>
            </div>
            <button class="v-modal-save-btn settings-action-btn" :disabled="isSavingPassword" @click="changePassword">
              {{ isSavingPassword ? '변경 중...' : '비밀번호 변경' }}
            </button>
          </section>

          <p v-if="message" class="settings-message">{{ message }}</p>
          <p v-if="errorMessage" class="settings-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import NavigationRail from '@/components/sections/NavigationRail.vue';
import { gymApi, userApi } from '@/services/apis';
import { extractPayload } from '@/utils/api';

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

const gymProfile = ref({
  name: '',
  address: '',
  description: '',
  categoryId: 1,
  tel: '',
});

const hours = ref(defaultHours());
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

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
});

const isSavingProfile = ref(false);
const isSavingHours = ref(false);
const isSavingAmenities = ref(false);
const isSavingProducts = ref(false);
const isCreatingException = ref(false);
const isSavingPassword = ref(false);
const message = ref('');
const errorMessage = ref('');

const toHHmmss = (value, fallback = '00:00:00') => {
  if (!value) return fallback;
  const time = String(value).slice(0, 8);
  if (time.length === 5) return `${time}:00`;
  if (time.length === 8) return time;
  return fallback;
};

const toHHmm = (value, fallback = '00:00') => {
  if (!value) return fallback;
  return String(value).slice(0, 5);
};

const formatTime = (value) => toHHmm(value, '--:--');

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
    exceptions.value = list;
  } catch (error) {
    exceptions.value = [];
  }
};

const loadMyGym = async () => {
  const response = await gymApi.myGym();
  const payload = extractPayload(response);

  let draft = null;
  try {
    const draftRaw = localStorage.getItem('gymOwnerOnboardingDraft');
    draft = draftRaw ? JSON.parse(draftRaw) : null;
  } catch (error) {
    draft = null;
  }

  gymProfile.value.name = payload.name || draft?.gymName || '';
  gymProfile.value.address = payload.address || draft?.gymAddress || '';
  gymProfile.value.description = payload.description || draft?.gymDescription || '';
  gymProfile.value.categoryId = Number(payload.categoryId || 1);
  gymProfile.value.tel = payload.tel || payload.phone || draft?.gymPhone || '';

  const hoursList = payload.hours || payload.businessHours || payload.gymHours || [];
  if (Array.isArray(hoursList) && hoursList.length > 0) {
    const merged = defaultHours();
    hoursList.forEach((item) => {
      const idx = merged.findIndex((base) => base.dayOfWeek === String(item.dayOfWeek || '').toUpperCase());
      if (idx < 0) return;
      merged[idx] = {
        ...merged[idx],
        openTime: toHHmm(item.openTime, merged[idx].openTime),
        closeTime: toHHmm(item.closeTime, merged[idx].closeTime),
        isClosed: Boolean(item.isClosed ?? item.closed),
      };
    });
    hours.value = merged;
  }

  const amenityList = payload.amenities || payload.amenityCodes || [];
  selectedAmenities.value = Array.isArray(amenityList)
    ? amenityList.map((a) => (typeof a === 'object' && a !== null ? a.code || a.amenityCode || a.name : a))
    : [];

  const productList = payload.products || [];
  if (Array.isArray(productList) && productList.length > 0) {
    products.value = productList.map((item) => ({
      productName: item.productName || item.name || '',
      price: Number(item.price || 0),
    }));
  }
};

const saveGymProfile = async () => {
  isSavingProfile.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    await gymApi.updateProfile({
      name: gymProfile.value.name,
      address: gymProfile.value.address,
      description: gymProfile.value.description,
      categoryId: Number(gymProfile.value.categoryId || 1),
      tel: gymProfile.value.tel,
    });
    message.value = '짐 기본 정보가 저장되었습니다.';
  } catch (error) {
    errorMessage.value = '짐 기본 정보 저장에 실패했습니다.';
  } finally {
    isSavingProfile.value = false;
  }
};

const saveHours = async () => {
  isSavingHours.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    await gymApi.replaceHours(hours.value.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      openTime: toHHmmss(item.openTime, '00:00:00'),
      closeTime: toHHmmss(item.closeTime, '00:00:00'),
      closed: Boolean(item.isClosed),
    })));
    message.value = '영업 시간이 저장되었습니다.';
  } catch (error) {
    errorMessage.value = '영업 시간 저장에 실패했습니다.';
  } finally {
    isSavingHours.value = false;
  }
};

const saveAmenities = async () => {
  isSavingAmenities.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    await gymApi.replaceAmenities(selectedAmenities.value);
    message.value = '편의시설이 저장되었습니다.';
  } catch (error) {
    errorMessage.value = '편의시설 저장에 실패했습니다.';
  } finally {
    isSavingAmenities.value = false;
  }
};

const addProduct = () => {
  products.value.push({ productName: '', price: 0 });
};

const removeProduct = (index) => {
  products.value = products.value.filter((_, idx) => idx !== index);
};

const saveProducts = async () => {
  isSavingProducts.value = true;
  message.value = '';
  errorMessage.value = '';
  try {
    const payload = products.value
      .filter((item) => item.productName)
      .map((item) => ({
        productName: item.productName,
        price: Number(item.price || 0),
      }));
    await gymApi.replaceProducts(payload);
    message.value = '상품 정보가 저장되었습니다.';
  } catch (error) {
    errorMessage.value = '상품 저장에 실패했습니다.';
  } finally {
    isSavingProducts.value = false;
  }
};

const createException = async () => {
  if (!exceptionForm.value.specificDate) {
    errorMessage.value = '예외 날짜를 선택해주세요.';
    return;
  }

  isCreatingException.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    await gymApi.createException({
      specificDate: exceptionForm.value.specificDate,
      openTime: exceptionForm.value.isClosed ? null : toHHmmss(exceptionForm.value.openTime, '09:00:00'),
      closeTime: exceptionForm.value.isClosed ? null : toHHmmss(exceptionForm.value.closeTime, '18:00:00'),
      closed: exceptionForm.value.isClosed,
      description: exceptionForm.value.description || null,
    });
    exceptionForm.value.specificDate = '';
    exceptionForm.value.description = '';
    await loadExceptions();
    message.value = '예외 운영시간이 추가되었습니다.';
  } catch (error) {
    errorMessage.value = '예외 운영시간 추가에 실패했습니다.';
  } finally {
    isCreatingException.value = false;
  }
};

const deleteException = async (id) => {
  if (!window.confirm('해당 예외 시간을 삭제할까요?')) return;
  try {
    await gymApi.deleteException(id);
    await loadExceptions();
  } catch (error) {
    errorMessage.value = '예외 운영시간 삭제에 실패했습니다.';
  }
};

const changePassword = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    errorMessage.value = '현재 비밀번호와 새 비밀번호를 입력해주세요.';
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.newPasswordConfirm) {
    errorMessage.value = '새 비밀번호 확인이 일치하지 않습니다.';
    return;
  }

  isSavingPassword.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    await userApi.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    passwordForm.value.currentPassword = '';
    passwordForm.value.newPassword = '';
    passwordForm.value.newPasswordConfirm = '';
    message.value = '비밀번호가 변경되었습니다.';
  } catch (error) {
    errorMessage.value = '비밀번호 변경에 실패했습니다.';
  } finally {
    isSavingPassword.value = false;
  }
};

onMounted(async () => {
  try {
    await loadMyGym();
  } catch (error) {
    errorMessage.value = '짐 정보를 불러오지 못했습니다.';
  }
  await loadExceptions();
});
</script>

<style scoped>
.settings-page {
  display: grid;
  gap: 16px;
}

.settings-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.settings-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.settings-section {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  gap: 10px;
}

.settings-section h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.settings-grid-2,
.settings-grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.settings-field {
  display: grid;
  gap: 6px;
}

.settings-field span {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.settings-field input,
.settings-field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 12px;
  background: #ffffff;
  font-size: 14px;
}

.settings-hours-grid {
  display: grid;
  gap: 8px;
}

.settings-hour-row {
  display: grid;
  grid-template-columns: 28px 54px 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.settings-hour-day {
  font-weight: 700;
  color: #334155;
  text-align: center;
}

.settings-hour-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #475569;
}

.settings-hour-row input[type='time'] {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px;
  background: #ffffff;
}

.settings-row-gap {
  display: grid;
  gap: 8px;
}

.settings-product-row,
.settings-exception-row {
  display: grid;
  grid-template-columns: 1fr 130px 70px;
  gap: 8px;
  align-items: center;
}

.settings-exception-row {
  grid-template-columns: 1fr 70px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px;
}

.settings-small-btn {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  min-height: 40px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.settings-inline-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.settings-small-action,
.settings-action-btn {
  width: 100%;
  min-height: 48px;
}

.settings-label {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.settings-help {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.settings-message {
  margin: 0;
  font-size: 13px;
  color: #166534;
}

.settings-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
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

@media (min-width: 900px) {
  .settings-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .settings-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
