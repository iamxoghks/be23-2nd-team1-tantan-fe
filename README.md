![tantan_logo_clean_white](https://github.com/beyond-sw-camp/be23-2nd-team1-tantan-be/blob/main/images/tantan_logo_clean_white.jpg)
### **프로젝트 소개**<br/>
TanTan은 지도를 중심으로 헬스장을 찾고, 비교하고, 문의까지 이어지게 만드는 웹앱입니다. 사용자는 네이버지도처럼 지도를 먼저 탐색하다가 핀을 클릭하면 왼쪽 슬라이드 패널로 해당 헬스장의 상세 정보가 자연스럽게 펼쳐지는 UI로, 원하는 헬스장을 빠르게 파악할 수 있습니다.<br/>
헬스장 상세 페이지에서는 헬스장 이름/주소/사진/평균 별점/리뷰 목록을 확인할 수 있고, 마음에 들면 즐겨찾기로 저장하거나 **1:1 상담 채팅(비실시간, DB 기반)**으로 문의를 남길 수 있습니다. 채팅은 사용자와 헬스장 관리자가 여러 메시지를 주고받으며 기록이 남는 형태로, “문의 → 응답 → 기록 관리”가 간단하게 돌아가도록 구성합니다.<br/>
TanTan은 사용자뿐 아니라 **헬스장 관리자(GYM_OWNER)**도 고려합니다. 헬스장 관리자는 본인 소속 헬스장만 등록/수정할 수 있고, 들어온 상담 채팅 목록을 확인해 응답할 수 있습니다. 또한 악성 리뷰 신고 등 운영에 필요한 최소 기능을 포함해, “헬스장 운영 관점”에서도 사용할 수 있게 설계했습니다.<br/>
추가로 커뮤니티(게시글/댓글/대댓글)와 운동 기록(일일 기록, 월간 캘린더 표시) 기능을 통해, 단순한 지도 검색을 넘어 사용자 참여와 재방문을 만드는 서비스 구조를 갖추었습니다.
권한은 **일반 사용자(USER) / 헬스장 관리자(GYM_OWNER) / 관리자(ADMIN)**로 분리되고, 인증은 JWT Token 기반으로 구현하였습니다.<br/>
## 🫂 팀원 소개
<table align="center">
  <tbody>
    <tr>
  <td align="center" width="150px">
    <a href="https://github.com/iamxoghks">
      <img src="https://github.com/beyond-sw-camp/be23-2nd-team1-tantan-be/blob/main/images/%ED%83%9C%ED%99%98-removebg-preview.png?raw=true" 
           style="width:100px; height:100px; object-fit: cover; border-radius: 50%;" alt="김태환"/><br />
      <sub><b> 김태환 </b></sub>
    </a>
  </td>

  <td align="center" width="150px">
    <a href="https://github.com/2001056">
      <img src="https://github.com/beyond-sw-camp/be23-2nd-team1-tantan-be/blob/main/images/%EB%B3%91%EC%B0%AC-removebg-preview.png?raw=true" 
           style="width:100px; height:100px; object-fit: cover; border-radius: 50%;" alt="이병찬"/><br />
      <sub><b> 이병찬 </b></sub>
    </a>
  </td>

  <td align="center" width="150px">
    <a href="https://github.com/ybrocks">
      <img src="https://github.com/beyond-sw-camp/be23-2nd-team1-tantan-be/blob/main/images/%EA%B0%95%ED%98%84-removebg-preview.png?raw=true" 
           style="width:100px; height:100px; object-fit: cover; border-radius: 50%;" alt="조강현"/><br />
      <sub><b> 조강현 </b></sub>
    </a>
  </td>

  <td align="center" width="150px">
    <a href="https://github.com/yune22">
      <img src="https://github.com/beyond-sw-camp/be23-2nd-team1-tantan-be/blob/main/images/%EC%A0%95%EC%9C%A4-removebg-preview.png?raw=true" 
           style="width:100px; height:100px; object-fit: cover; border-radius: 50%;" alt="황정윤"/><br />
      <sub><b> 황정윤 </b></sub>
    </a>
  </td>
</tr>
  </tbody>
</table>

## 🛠️ 기술스택
### 🧩 백엔드 기술

<p align="center">
  <img src="https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/springsecurity-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" />
  <img src="https://img.shields.io/badge/springdatajpa-6DB33F?style=for-the-badge&logo=hibernate&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/STOMP/WebSocket-FF6B6B?style=for-the-badge&logo=socket.io&logoColor=white"/>
</p>

### 🎨 프론트엔드 기술

<p align="center">
  <img src="https://img.shields.io/badge/css-663399?style=for-the-badge&logo=css&logoColor=white" />
  <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white" />
  <img src="https://img.shields.io/badge/vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/vuerouter-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white" />
  <img src="https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=vue.js&logoColor=black"/>
</p>

### 🗄️ 데이터 기술

<p align="center">
  <img src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white" />
  <img src="https://img.shields.io/badge/SQL-336791?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=redis&logoColor=white" />
</p>

### 🚀 인프라/배포

<p align="center">
  <img src="https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Oracle%20Cloud%20Infrastructure-F80000?style=for-the-badge&logo=oracle&logoColor=white" />
</p>

### 🧰 개발 도구

<p align="center">
  <img src="https://img.shields.io/badge/gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white" />
  <img src="https://img.shields.io/badge/intellijidea-000000?style=for-the-badge&logo=intellijidea&logoColor=white" />
  <img src="https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" />
  <img src="https://img.shields.io/badge/DataGrip-000000?style=for-the-badge&logo=datagrip&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL%20Workbench-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis%20Insight-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</p>

### 🤝 협업/기획 도구

<p align="center">
  <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" />
  <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white" />
  <img src="https://img.shields.io/badge/ERDCloud-1F1F1F?style=for-the-badge&logo=linkerd&logoColor=white" />
</p>

### 🔍 사용한 핵심 기술
| 사용 기술 | 설명 |
| ---------- | ---------------------------------------------- |
| **OAuth2 소셜 로그인** | 자체 로그인 외에 **Google, Kakao, Naver** 소셜 로그인을 통합 구현하여 사용자 접근성을 극대화했습니다. |
| **JWT & Spring Security** | Access/Refresh Token 기반의 이중 보안 체계와 Stateless 아키텍처를 구축하여 인증의 안전성과 서버 확장성을 동시에 확보했습니다. |
| **Redis 기반 토큰 및 세션 관리** | Refresh Token을 Redis에 저장하고 TTL(Time To Live)을 통해 자동 관리함으로써, 토큰 탈취 위험을 최소화하고 인증 성능을 최적화했습니다. |
| **Redis 역방향 인덱스 (ZSet)** | 대규모 **팔로워/팔로잉 및 즐겨찾기** 데이터를 Redis ZSet으로 관리하여, 정렬된 목록의 고속 추출과 실시간 카운팅 성능을 비약적으로 향상시켰습니다. |
| **Redis Pub/Sub & WebSocket** | 메시지 브로커 기반의 **STOMP 프로토콜**과 Redis Pub/Sub을 결합하여, 분산 환경에서도 안정적인 실시간 양방향 채팅 및 상태 공유 기능을 구현했습니다. |
| **AWS S3 기반 폴리모픽 이미지 시스템** | **RefType/RefId** 구조를 통해 프로필, 게시글, 리뷰 등 다양한 도메인의 이미지를 통합 관리하며, S3 연동과 Soft Delete 패턴으로 데이터 정합성을 유지합니다. |
| **Naver Map API 통합** | **Geocoding API**를 통한 주소-좌표 자동 변환 및 **Driving Direction API**를 활용한 길 찾기 기능을 제공하여 위치 기반 서비스의 정확도를 높였습니다. |
| **SSE & @Async 실시간 알림** | **Server-Sent Events(SSE)**와 비동기(`@Async`) 처리를 조합하여, 대규모 팔로워 대상의 공지 알림 발송 시 메인 로직의 지연 없이 실시간 정보를 전달합니다. |
| **운영 상태 판단 알고리즘** | 정기 휴무일과 예외 공휴일을 고려한 로직을 통해, 현재 시각 기준 헬스장의 **영업 여부(OPEN/CLOSED)**를 실시간으로 판별하여 사용자에게 제공합니다. |
| **Soft Delete & 데이터 거버넌스** | 전사적인 **DelYn** 패턴과 **BaseTimeEntity** 적용으로 실제 DB 삭제 없이 데이터를 보호하며, 관리자 복구 기능 및 데이터 추적성을 강화했습니다. |
| **Cleanup 자동화 프로세스** | 사용자 탈퇴 시 Redis(팔로우/즐겨찾기), RDB(좋아요), S3(이미지) 등 여러 저장소에 분산된 연관 데이터를 연쇄적으로 정리하여 데이터 무결성을 보장합니다. |
| **Spring RestClient API 통신** | 최신 **Spring RestClient**를 도입하여 외부 API(Naver Map 등)와의 통신을 선언적이고 효율적으로 관리하며 예외 처리 가독성을 높였습니다. |

## 🛠️ 시스템 아키텍쳐

[//]: # (<img width="944" height="471" alt="drawio" src="https://github.com/user-attachments/assets/ae25777f-9bb5-4a4a-a8e4-8378cc5f050c" />)


## <span id="11">🚦 트러블 슈팅</span>

[//]: # (<details>)

[//]: # (<summary> 로그인  </summary>)

[//]: # ()
[//]: # (<div>)

[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    1. SNS 로그인 연동)

[//]: # (  </summary>)

[//]: # (<div>)

[//]: # ()
[//]: # (1. **문제 상황**  )

[//]: # (   기존 회원이 SNS 로그인 시도 시, 로그인 실패 발생<br>)

[//]: # (   원인: 기존 회원 이메일과 SNS 계정 이메일이 동일 → 회원가입 로직에서 중복 Insert 시도 → DB 충돌 발생)

[//]: # ()
[//]: # (2. **시도**  )

[//]: # (   SNS 로그인 시 기존 회원일 경우, 409 &#40;CONFLICT&#41; 응답을 반환하여 중복 회원가입 방지<br>)

[//]: # (   프론트는 409를 감지 후 연동 여부를 사용자에게 확인 후, 연동 동의 시, 프론트는 이전의 인가코드&#40;code&#41;로 서버에 재로그인 요청<br>)

[//]: # (   서버는 재로그인 과정에서 동일 인가 코드를 다시 사용해 구글 토큰 교환 요청→ 구글은 이미 사용된 코드라 판단, invalid_grand 오류 반환)

[//]: # ()
[//]: # (3. **해결**)

[//]: # (   SNS 로그인 시 이메일 충돌 발생 → 서버는 409와 함께 LinkTicket { email, socialId, provider } &#40;임시토큰&#41;을 발급하여 응답으로 반환<br>)

[//]: # (   서버는 Redis에 10분 TTL을 걸어 저장<br>)

[//]: # (   프론트는 409를 감지 후 연동 여부를 사용자에게 확인 후, 연동 동의 시, LinkTikcet을 가지고 로그인 재요청<br>)

[//]: # (   서버는 LinkTicket을 검증 후, 페이로드를 가지고 SNS 계정과 연동&#40;Social ID/Type 업데이트&#41;<br>)

[//]: # (   로그인 완료 및 정상 응답 반환)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    2. Refresh Token 보안 강화)

[//]: # (  </summary>)

[//]: # (  <div>)

[//]: # ()
[//]: # (1. **문제 상황**  )

[//]: # (   Local Storage에 저장된 데이터는, XSS 공격을 통해 탈취 될 수 있음.<br>)

[//]: # (   악성 스크립트 공격 - localStorage.getItem&#40;"refreshToken"&#41;, document.cookie 등)

[//]: # ()
[//]: # (2. **해결1**)

[//]: # (   Refresh Token을 HTTP Only Cookie로 관리<br>)

[//]: # (   HTTP Only Cookie → JS에서 접근할 수 없는 곳에 쿠키를 저장, 요청을 보낼 때 헤더에 담아서 전송→ XSS 공격 방어 가능)

[//]: # ()
[//]: # (3. **문제 상황2**  )

[//]: # (   HTTP Only Cookie 사용 → CSRF 공격에 노출<br>)

[//]: # (   CSRF 공격 - 인증된 쿠키를 인증되지 않은 사이트에서도 헤더에 담아 요청 전송)

[//]: # ()
[//]: # (4. **해결2**)

[//]: # (   Origin/Referer가드를 적용<br>)

[//]: # (   Origin/Referer가드<br>)

[//]: # (   → 브라우저에서 요청을 보낼 때, 요청을 보낸 페이지의 URL을 담아서 서버로 전송<br>)

[//]: # (   → 서버는 화이트리스트와 비교하여 검증 후, 일치하지 않으면 403 반환<br>)

[//]: # (   추가로 HTTP Only Cookie 설정에서, 쿠키를 필요로 하는 요청만 쿠키를 담도록 허용 &#40;token refresh / logout&#41;)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (</div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # (<details>)

[//]: # (<summary> 리뷰  </summary>)

[//]: # ()
[//]: # (<div>)

[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    1. 리뷰 평점 계산을 위한 테이블 구조 개선)

[//]: # (  </summary>)

[//]: # (<div>)

[//]: # ()
[//]: # (1. **문제 상황**  )

[//]: # (   호텔 평점을 계산하기 위해 모든 리뷰 데이터를 불러와 합산해야 함 → 성능 저하 우려<br>)

[//]: # (   예&#41; 4.8 &#40;100&#41; → 이 데이터만을 위해 모든 데이터 조회 및 AVG / COUNT 계산 필요)

[//]: # ()
[//]: # (2. **해결**)

[//]: # (   호텔 ID를 외래키로 갖는 별도 테이블 생성 { hotel_id, sum, count }<br>)

[//]: # (   리뷰 작성/수정/삭제 시, 별점의 총합&#40;sum&#41;과 개수&#40;count&#41;를 업데이트<br>)

[//]: # (   특정 호텔의 평점과 리뷰 개수를 바로 조회할 수 있도록 최적화)

[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (</div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # (<details>)

[//]: # (<summary> 예약  </summary>)

[//]: # ()
[//]: # (<div>)

[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    1. 예약 동시성 처리)

[//]: # (  </summary>)

[//]: # (<div>)

[//]: # ()
[//]: # (1. **문제 상황**  )

[//]: # (   숙소 예약 서비스 특성상 재고관리가 필수적이었고 동시성 문제를 해결하기 위해 redis에서 재고관리를 진행했습니다.)

[//]: # (   redis에 저장된 예약건수를 확인한 후 DB에 저장되어있던 최대 재고수와 비교해서 예약의 진행 여부를 판단하도록 했습니다.)

[//]: # (   이 과정에서 redis 조회와, 업데이트가 동시에 이루어지는 것이 아니기 때문에 동시성 문제가 발생할 수 있음을 발견했습니다.)

[//]: # (   문제는 마지막 재고를 조회한 사용자가 값을 업데이트하기 전에 또 다른 사용자가 레디스에서 값을 조회한 탓에 발생한 것이었습니다.   )

[//]: # (   <img width="1053" height="402" alt="image" src="https://github.com/user-attachments/assets/909b4af8-1aea-476a-943d-0dd8a477bd58" />)

[//]: # (<figure>)

[//]: # (  <img width="1904" height="885" alt="image" src="https://github.com/user-attachments/assets/916b21dc-716f-479f-b9fc-5646cf669dd6" />)

[//]: # (  <figcaption>db재고는 500개지만 redis에는 502개의 예약이 들어간 모습</figcaption>)

[//]: # (</figure>)

[//]: # ()
[//]: # (2. **해결 방안**  )

[//]: # (   redis 조회 - 업데이트의 원자성을 보장하기 위해 luascript를 도입했습니다. 모든 예약내역은 그 날짜가 지나면 삭제되어야 했기 때문에 날짜 정보를 hash형태로 저장한 뒤 각 키값에 ttl을 설정해 해당 날짜가 지나면 redis에서 삭제되도록 구현하였습니다.)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    2. 서버 대기열)

[//]: # (  </summary>)

[//]: # (  <div>)

[//]: # ()
[//]: # (1. **문제 상황**  )

[//]: # (   1번 해결 방안으로 luascript를 사용한 탓에 조회-업데이트가 한번에 이뤄지는 구조이기 때문에 예약-결제-예약확정 구조가 서버에 부하를 줄 수 있다고 생각했습니다.)

[//]: # (   특히 숙소 예약 서비스 특성 상 특가 이벤트와 같은 경우에 특정 객실에 사용자가 몰리는 일이 발생할 수 있었고 그 결과 서버가 느려질 수 있지 않을까 하는 우려가 들었습니다.)

[//]: # ()
[//]: # (2. **해결 방안**  )

[//]: # (   특정 객실이 특가로 나왔다고 테스트 시나리오를 세운 뒤 예약 페이지에 진입하는 모든 사용자가 대기열 큐에 올라가도록 하였습니다.)

[//]: # (   서버에서 설정한 대기열 순서보다 앞에 있는 사용자만 예약 페이지의 이용이 가능하도록 하였고 순번이 뒤인 사용자들은 자신들의 순번을 실시간으로 전달받으며 기다리도록 구현하였습니다.)

[//]: # (   ![채팅 대기열 gif]&#40;https://github.com/user-attachments/assets/c0f2f445-4435-487f-8e03-a96e1ff7b002&#41;)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (</div>)

[//]: # (</details>)

[//]: # (<details>)

[//]: # (<summary> 채팅  </summary>)

[//]: # ()
[//]: # (<div>)

[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    1. 메시지 소실)

[//]: # (  </summary>)

[//]: # (  <div>)

[//]: # ()
[//]: # (1. **문제 상황**  )

[//]: # (   기존 채팅 서비스는 웹소켓을 통해 메시지를 전송하고 서버에서 다시 발행해주는 구조였습니다.)

[//]: # (   그런데 대규모 트래픽이 발생할 경우 중간 과정에 메시지가 소실 될 우려가 존재했습니다.)

[//]: # ()
[//]: # ()
[//]: # (2. **해결 방안**  )

[//]: # (   pub/sub 대신 로그 기반의 stream 기능을 이용하여 redis에 메시지가 저장된 뒤 발행되도록 하였습니다.)

[//]: # (   consumer들은 메시지를 소비하는 것과 동시에 db에 메시지를 저장하며 싱크를 맞추게 됩니다.)

[//]: # ()
[//]: # (    <img width="1904" height="885" alt="image" src="https://github.com/user-attachments/assets/916b21dc-716f-479f-b9fc-5646cf669dd6" />)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    2. 서버 과부화)

[//]: # (  </summary>)

[//]: # (  <div>)

[//]: # ()
[//]: # (1. **문제 상황**  )

[//]: # (   채팅 서비스는 사용자가 메시지를 전송할 때마다 서버에 API 요청을 보내도록 설계되어 있습니다.  )

[//]: # (   그렇다 보니 짧은 시간 내에 악의적으로 메시지를 반복 전송할 경우 서버에 부하가 걸릴 수 있다는 문제가 내재되어 있었습니다.  )

[//]: # (   특히 단체 채팅 기능이 존재하기 때문에 사용자가 많아질수록 서버 부하가 커질 우려가 있었습니다.)

[//]: # ()
[//]: # (2. **해결 방안**  )

[//]: # (   이 문제를 방지하기 위해서는 특정 시간 동안 사용자의 메시지 전송 횟수의 제한을 두는 편이 좋다고 생각했습니다.  )

[//]: # (   이를 위해 rateLimiter를 사용하였으며 사용자의 이메일을 키값으로, 메시지 전송 시간을 담아두는 리스트를 value 값으로 두어  )

[//]: # (   설정해둔 값을 넘어설 경우 일정 시간 동안 채팅 기능의 제한이 이루어지도록 하였습니다.  )

[//]: # (   테스트 케이스를 위해 1분에 10회의 채팅 제한을 두고, 채팅 제한 시간은 5분으로 설정하였습니다.)

[//]: # ()
[//]: # (![채팅 도배 테스트]&#40;https://github.com/user-attachments/assets/044ef4f7-f1c0-4704-b4c3-39ddf80e782b&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (</div>)

[//]: # (</details>)

[//]: # (<details>)

[//]: # (<summary> 호텔 </summary>)

[//]: # ()
[//]: # (<div>)

[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    1. 외부 API 사용&#40;RestTemplate 문제&#41;)

[//]: # (  </summary>)

[//]: # (  <div>)

[//]: # ()
[//]: # (1. 문제 상황 <br />)

[//]: # (   카카오 GEOCODING API를 사용하여 주소를 좌표로 변환하려 했으나, RestTemplate를 통해 요청을 보내면 ACCESS DENIED 오류가 지속적으로 발생했습니다.)

[//]: # ()
[//]: # (2. 시도 <br />)

[//]: # (   API 키를 재발급하고 코드에 직접 입력하는 등 다양한 시도를 했지만 해결되지 않았습니다. Postman으로 직접 테스트했을 때는 정상적으로 작동하여 API 키 자체에는 문제가 없다고 판단했습니다. 이는 결국 RestTemplate의 요청 처리 방식에 문제가 있었다는 결론으로 이어졌습니다.)

[//]: # ()
[//]: # (3. 해결방안 <br />)

[//]: # (   RestTemplate 대신 WebClient로 코드를 변경하자 문제가 해결되고 API 호출이 정상적으로 성공했습니다.)

[//]: # ()
[//]: # (4. 정리 링크 <br />)

[//]: # (   [RestTemplate 문제]&#40;https://velog.io/@kishinoa/JPA-%EB%AC%B4%ED%95%9C%EC%B0%B8%EC%A1%B0-%EB%AC%B8%EC%A0%9C&#41;)

[//]: # (</div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    2. JPA 무한참조)

[//]: # (  </summary>)

[//]: # (  <div>)

[//]: # ()
[//]: # (1. 문제 상황 <br />)

[//]: # (   호텔 상세 정보 조회 API 개발 중, Hotel - Room - RoomImage 엔티티 간의 양방향 관계로 인해 JSON 변환 시 무한 참조&#40;StackOverflowError&#41;가 발생했습니다.)

[//]: # ()
[//]: # (2. 시도 <br />)

[//]: # (   무한 참조를 끊기 위해, 엔티티를 직접 사용하지 않고 DTO&#40;Data Transfer Object&#41;를 분리하여 API 응답에 필요한 데이터만 담도록 구조를 변경했습니다.)

[//]: # ()
[//]: # (3. 해결방안 <br />)

[//]: # (   HotelDetailResponseDto에 RoomDetailResponseDto 리스트를, RoomDetailResponseDto에 RoomImageResponseDto 리스트를 포함시켰습니다.)

[//]: # (   엔티티 객체를 DTO로 변환하여 데이터를 전달함으로써 순환 참조를 완전히 제거하고 문제를 해결했습니다.)

[//]: # ()
[//]: # (4. 정리 링크 <br />)

[//]: # (   [JPA 무한참조]&#40;https://velog.io/@kishinoa/JPA-%EB%AC%B4%ED%95%9C%EC%B0%B8%EC%A1%B0-%EB%AC%B8%EC%A0%9C&#41;)

[//]: # (</div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>)

[//]: # (    3. 톰캣 FileCountLimitExceededException)

[//]: # (  </summary>)

[//]: # (<div>)

[//]: # ()
[//]: # (1. 문제 상황 <br />)

[//]: # (   호텔 등록 기능에서 10장 이상의 이미지를 업로드할 경우, 서버에서 FileCountLimitExceededException 오류가 발생했습니다.)

[//]: # (   이는 톰캣 서버의 기본 설정이 한 번에 받을 수 있는 파일의 개수를 초과했기 때문에 발생한 문제입니다.)

[//]: # ()
[//]: # (2. 시도 <br />)

[//]: # (   application.yml 파일에서 servlet.multipart.max-file-size나 max-request-size 같은 설정을 변경해 보았습니다.)

[//]: # (   하지만 이 설정들은 개별 파일 크기나 전체 요청 크기를 제한하는 용도일 뿐, 파일의 개수를 직접 제어할 수는 없었습니다.)

[//]: # ()
[//]: # (3. 해결방안 <br />)

[//]: # (   Spring Boot의 자동 구성에 의존하는 대신, **TomcatServletWebServerFactory**를 직접 커스터마이징하는 방식으로 문제를 해결했습니다.)

[//]: # (   TomcatConfig라는 @Configuration 클래스를 만들고, TomcatServletWebServerFactory 빈&#40;Bean&#41;을 등록하여 setTomcatConnectorCustomizers 메서드를 통해 톰캣 커넥터 설정을 직접 변경했습니다.)

[//]: # (   이 과정에서 TomcatConnectorCustomizer를 사용하여 setMaxSwallowSize와 setMaxPostSize를 원하는 값으로 설정하고, 핵심적으로 setMaxParts 값을 기본값&#40;10&#41;보다 크게 설정하여 파일 개수 제한을 늘려주었습니다.)

[//]: # (   이처럼 application.yml에서 변경할 수 없는 톰캣의 세부 설정을 직접 코드 레벨에서 제어함으로써, 파일 개수 제한 문제를 해결할 수 있었습니다.)

[//]: # ()
[//]: # (4. 정리 링크 <br />)

[//]: # (   [톰캣 FileCountLimitExceededException]&#40;https://velog.io/@kishinoa/%ED%86%B0%EC%BA%A3FileCountLimitExceededException-%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0&#41;)

[//]: # (</div>)

[//]: # (</details>)

[//]: # ()
[//]: # (</div>)

[//]: # (</details>)


## 📄 기획
### 🧩 ERD 모델링
[ERD설계](https://www.erdcloud.com/d/ntgkZ9ocSqbtQKYMS)

### 🗂️ WBS(Work Breakdown Structure)
[WBS](https://docs.google.com/spreadsheets/d/1UjxzOpptgDh60qLhGtd6FsADTPM40OOCVrUY1_OP__w/edit?usp=sharing)

### 📬 Postman API
[Postman Workspace](https://www.postman.com/bold-rocket-952382/workspace/be23-2nd-team1-tantan)

### 🎨 디자인
[Figma](https://www.figma.com/make/Zu6ksFFLS1pRErocl6wR63/TanTan-%EC%A7%80%EB%8F%84-%EA%B8%B0%EB%B0%98-%EC%9B%B9%EC%95%B1-UI?t=t98E30dOLmbsPKSH-1),
[Google Stitch](https://stitch.withgoogle.com/projects/12574759648480207988),
[실 디자인 v0.2](https://tantan-proejct-front-temp.vercel.app)

### 📄 주요기능, 요구사항명세서, 팀 전략
[요구사항 명세서](https://docs.google.com/spreadsheets/d/1UjxzOpptgDh60qLhGtd6FsADTPM40OOCVrUY1_OP__w/edit?gid=2109308759#gid=2109308759)

[//]: # (## <span id="11">🖥️ 주요 기능 소개&#40;테스트케이스&#41;</span>)

[//]: # (<details>)

[//]: # (  <summary> 👥 사용자 </summary>)

[//]: # (<details>)

[//]: # (  <summary>회원가입</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![회원가입]&#40;https://github.com/user-attachments/assets/530a9258-93f0-4b6d-b2ec-5dd82cbabf86&#41;)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>이메일 로그인</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![이메일로그인]&#40;https://github.com/user-attachments/assets/809f003c-0651-44b5-8f7b-138be3e5915c&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>구글 회원가입 / 로그인</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![구글회원가입및로그인]&#40;https://github.com/user-attachments/assets/ca1c6479-ad4e-4a82-aa0e-adf4c127bd9b&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>카카오 회원가입 / 로그인</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![카카오회원가입및로그인]&#40;https://github.com/user-attachments/assets/1ee3ff99-1bbd-44c2-b0d1-ed888f0f1a41&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>내 정보 조회&#40;마이페이지&#41;</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![내정보조회마이페이지]&#40;https://github.com/user-attachments/assets/7b90a8e7-c094-4c7b-bf85-8d5c4cd1ff53&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>내 정보 수정</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![내정보수정]&#40;https://github.com/user-attachments/assets/a97c255f-b5ec-4385-ad4f-7e9c71853388&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>사용자 탈퇴</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![사용자탈퇴]&#40;https://github.com/user-attachments/assets/6b6902c9-b3ea-4b51-8dcb-b1d3783e1213&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # ( <summary> 🔑 호스트 기능 </summary>)

[//]: # (<details>)

[//]: # (  <summary>호텔 등록</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![호텔 등록]&#40;https://github.com/user-attachments/assets/b8f4fe54-b0a1-42a1-852c-354911cb826b&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (<details>)

[//]: # (  <summary>호텔 수정</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![호텔 수정]&#40;https://github.com/user-attachments/assets/767c20af-3150-41f0-986f-5c66195ee7f0&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>호스트 채팅 공지사항 등록</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![호스트 공지 등록]&#40;https://github.com/user-attachments/assets/c3286910-76b3-4326-a13f-fb707545d000&#41;)

[//]: # ()
[//]: # (<img width="926" height="289" alt="image" src="https://github.com/user-attachments/assets/7db8fdf2-3475-49cc-919b-c6dbf64f7a14" />)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (<details>)

[//]: # (  <summary>호스트 채팅 공지사항 비활성화</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![공지 비활성화]&#40;https://github.com/user-attachments/assets/51cdcd50-359c-4aaa-9b6d-c4a9b22e9371&#41;)

[//]: # (<img width="940" height="311" alt="image" src="https://github.com/user-attachments/assets/2b0a5003-22d8-4183-aeff-5b88e265c036" />)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>⚙️ 관리자 화면</summary>)

[//]: # (<details>)

[//]: # (  <summary>호텔 승인</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![호텔 승인]&#40;https://github.com/user-attachments/assets/b6346ad3-167b-4620-9d7d-87d0b71012d2&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>🏨 호텔 조회</summary>)

[//]: # (<details>)

[//]: # (  <summary>지역명 조회</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![지역명 검색]&#40;https://github.com/user-attachments/assets/4da13680-e6d7-4034-b94d-fb494e00a907&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>호텔명 조회</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![호텔명 검색]&#40;https://github.com/user-attachments/assets/d4bb8898-4f92-4549-8b1e-628532c27737&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>호텔검색 필터기능</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![필터 기능]&#40;https://github.com/user-attachments/assets/4b9c6274-1f0d-4744-9839-d8a01a25a3e0&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>호텔검색 정렬기능</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![정렬 기능]&#40;https://github.com/user-attachments/assets/c9e5c363-5608-4260-89b1-be90b82337af&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>내 주변 호텔 조회</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![내 주변 호텔]&#40;https://github.com/user-attachments/assets/5acc8d59-9f36-4f56-a5f5-061ec643466d&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>📅 예약</summary>)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>예약 성공</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![예약 성공]&#40;https://github.com/user-attachments/assets/a198e262-3d43-4d74-97ad-6050846649a7&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>예약 실패</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![예약실패 최종]&#40;https://github.com/user-attachments/assets/3d462ddb-8119-4073-8e02-e953c924f973&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>예약 내역 조회</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![예약 내역]&#40;https://github.com/user-attachments/assets/31c34501-187e-4b74-b10c-8082f6a33b9d&#41;)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>예약 상세 내역 조회</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![예약 상세 내역]&#40;https://github.com/user-attachments/assets/1aa81a29-261e-4f26-9b2a-2d5728448eb7&#41;)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>예약 호스트 연락 </summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![예약-호스트 연락]&#40;https://github.com/user-attachments/assets/91d7552e-f1b7-4a9b-9b8b-e4b50edefc86&#41;)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>💬 채팅</summary>)

[//]: # (<details>)

[//]: # (  <summary>채팅 </summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![채팅]&#40;https://github.com/user-attachments/assets/f9020b80-39f5-4e59-83db-0cc830e30083&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (<details>)

[//]: # (  <summary>채팅 알림 </summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![채팅-알림 &#40;1&#41;]&#40;https://github.com/user-attachments/assets/c4c93492-c861-410b-a15c-df1674210174&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>✏️ 리뷰</summary>)

[//]: # (<details>)

[//]: # (  <summary>호텔 리뷰조회</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![호텔리뷰조회]&#40;https://github.com/user-attachments/assets/e8ddbdb4-669a-442e-af04-20ea8b329622&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>리뷰작성</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![리뷰작성]&#40;https://github.com/user-attachments/assets/d48db345-2a71-4eae-a7eb-3344a9696c18&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>내 리뷰 조회&#40;마이페이지&#41;</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![내리뷰조회]&#40;https://github.com/user-attachments/assets/2cb8e40f-8cb4-4fe0-9e73-42d56bd22c51&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>내 리뷰 수정</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![내리뷰수정]&#40;https://github.com/user-attachments/assets/4eee199b-b108-4720-a984-acd5cdc0ebb7&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>내 리뷰 삭제</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![내리뷰삭제]&#40;https://github.com/user-attachments/assets/49aca08d-99b0-43b9-8d7a-37e38d580bd2&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>리뷰 답글 작성</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![호스트리뷰답글작성]&#40;https://github.com/user-attachments/assets/fa9a711d-d035-4cfd-9dc3-4de98407543c&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>리뷰 답글 수정/삭제</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![호스트리뷰답글수정삭제]&#40;https://github.com/user-attachments/assets/da54ed75-762a-4355-8e06-5fc47c89ecc6&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>🔔 알림</summary>)

[//]: # (<details>)

[//]: # (  <summary>예약성공 알림&#40;사용자, 실시간x&#41;</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (  <img width="423" height="416" alt="사용자 예약확정 알림" src="https://github.com/user-attachments/assets/ddd70b3c-40db-4d88-8940-ca1d30fc3922" />)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>예약성공 알림&#40;호스트, 실시간o&#41;</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # ()
[//]: # (![호스트알림]&#40;https://github.com/user-attachments/assets/b66befaa-a9e2-4f0f-b2bc-82a5cd45cf5f&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>호텔등록 알림&#40;관리자, 실시간o&#41;</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![관리자알림]&#40;https://github.com/user-attachments/assets/067cafe3-ecef-4444-8410-cc3b3ed51808&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>입실 하루 전 알림&#40;사용자, 실시간x&#41;</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (<img width="417" height="253" alt="사용자 내일 입실 알림" src="https://github.com/user-attachments/assets/e16c3ca2-20ff-436d-a1f8-a8ad91e1a8bb" />)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (  <summary>퇴실 후 리뷰 요청 알림&#40;사용자, 실시간x&#41;</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (<img width="408" height="269" alt="사용자 리뷰 요청 알림" src="https://github.com/user-attachments/assets/f85d1f43-ad23-4bce-9ef1-fb920c3da9ce" />)

[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # (</details>)

[//]: # ()
[//]: # (<details>)

[//]: # (<summary>♥️ 찜</summary>)

[//]: # (<details>)

[//]: # (  <summary>사용자 찜 기능</summary>)

[//]: # (  <div align="center">)

[//]: # ()
[//]: # (![찜기능]&#40;https://github.com/user-attachments/assets/adff0a8b-9aaa-4848-bc24-70f6849dbbd6&#41;)

[//]: # ()
[//]: # ()
[//]: # (  </div>)

[//]: # (</details>)

[//]: # ()
[//]: # (</details>)

[//]: # ()
[//]: # ()
