import { test, expect } from '@playwright/test';

// 메인 페이지 테스트
test.describe('메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('찬양 섹션의 전체보기 링크 클릭 시 찬양 전체 페이지로 이동', async ({ page }) => {
    // data-testid로 구분된 전체보기 링크 클릭
    await page.getByTestId('hymn-view-all').click();
    await expect(page).toHaveURL(/\/hymns\?type=0/);
  });

  test('설교 섹션의 전체보기 링크 클릭 시 설교 전체 페이지로 이동', async ({ page }) => {
    await page.getByTestId('sermon-view-all').click();
    await expect(page).toHaveURL(/\/sermons\?type=0/);
  });

  test('소식 섹션의 전체보기 링크 클릭 시 소식 전체 페이지로 이동', async ({ page }) => {
    await page.getByTestId('news-view-all').click();
    await expect(page).toHaveURL(/\/news\?type=0/);
  });

  test('영성 섹션의 전체보기 링크 클릭 시 영성 전체 페이지로 이동', async ({ page }) => {
    await page.getByTestId('spirit-view-all').click();
    await expect(page).toHaveURL(/\/sermons\?type=1/);
  });

  test('홈 전체 페이지에서 content-card 클릭 시 다이얼로그가 뜨는지 확인', async ({ page }) => {
    // 첫 번째 content-card 클릭
    const firstCard = page.getByTestId('content-card').first();
    await firstCard.click();
    // 다이얼로그가 뜨는지 확인
    await expect(page.getByTestId('content-card-dialog')).toBeVisible();
    await expect(page.getByTestId('content-card-close-button')).toBeVisible();
    await page.getByTestId('content-card-close-button').click();
    await expect(page.getByTestId('content-card-dialog')).not.toBeVisible();
    await expect(page.getByTestId('content-card-close-button')).not.toBeVisible();
  });

  test('홈 전체 페이지에서 community-card 클릭 시 다이얼로그가 뜨는지 확인', async ({ page }) => {
    // 첫 번째 community-card 클릭
    const firstCard = page.getByTestId('community-card').first();
    await firstCard.click();
    // 다이얼로그가 뜨는지 확인
    await expect(page.getByTestId('community-card-image')).toBeVisible();
    await expect(page.getByTestId('community-card-close-button')).toBeVisible();
    await page.getByTestId('community-card-close-button').click();
    await expect(page.getByTestId('community-card-image')).not.toBeVisible();
    await expect(page.getByTestId('community-card-close-button')).not.toBeVisible();
  });

  test('홈 전체 페이지에서 sermon-card 클릭 시 다이얼로그가 뜨는지 확인', async ({ page }) => {
    // 첫 번째 sermon-card 클릭
    const firstCard = page.getByTestId('sermon-card-button').first();
    await firstCard.click();
    // 다이얼로그가 뜨는지 확인
    await expect(page.getByTestId('sermon-card-dialog-content')).toBeVisible();
  });

});

test.describe('홈 전체에 모킹 테스트', () => {
  


    

  test('홈 전체 페이지에서 /api/hymns 호출을 모킹하여 데이터가 렌더링되는지 확인', async ({ page }) => {

    await page.goto('http://localhost:3000/');
// /api/hymns 요청을 모킹
    await page.route('**/api/hymns?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          payload: {
            items: [
              {
                id: '1',
                name: '테스트 찬양',
                desc: '테스트 찬양 설명',
                url: 'test-youtube-id',
                createdAt: '2024-06-01T00:00:00Z'
              }
            ]
          }
        }),
      });
    });

    // 모킹된 데이터가 실제로 렌더링되는지 확인
    await expect(page.getByTestId('content-card-title-hymn')).toHaveText('테스트 찬양');
    await expect(page.getByTestId('content-card-desc-hymn')).toHaveText('테스트 찬양 설명');
  });

  test('홈 전체 페이지에서 /api/sermons?type=0 호출을 모킹하여 데이터가 렌더링되는지 확인', async ({ page }) => {
   
    await page.goto('http://localhost:3000/');
// /api/sermons 요청을 모킹
    await page.route('**/api/sermons?page=1&limit=10&type=0', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          payload: {
            items: [
              {
                id: '1',
                name: '테스트 설교',
                desc: '테스트 설교 설명',
                url: 'test-youtube-id',
                createdAt: '2024-06-01T00:00:00Z'
              }
            ]
          }
        }),
      });
    });

    // 모킹된 데이터가 실제로 렌더링되는지 확인
    await expect(page.getByTestId('content-card-title-sermon')).toHaveText('테스트 설교');
    await expect(page.getByTestId('content-card-desc-sermon')).toHaveText('테스트 설교 설명');
  });

  test('홈 전체 페이지에서 /api/sermons?type=1 호출을 모킹하여 데이터가 렌더링되는지 확인', async ({ page }) => {
await page.goto('http://localhost:3000/');

    // /api/sermons 요청을 모킹
    await page.route('**/api/sermons?page=1&limit=10&type=1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          payload: {
            items: [
              {
                id: '1',
                name: '테스트 영성',
                desc: '테스트 영성 설명',
                url: 'test-youtube-id',
                createdAt: '2024-06-01T00:00:00Z'
              }
            ]
          }
        }),
      });

    });
    // 모킹된 데이터가 실제로 렌더링되는지 확인
    await expect(page.getByTestId('sermon-card-title')).toHaveText('테스트 영성');
    await expect(page.getByTestId('sermon-card-desc')).toHaveText('테스트 영성 설명');

  });

  test('홈 전체 페이지에서 /api/communities 호출을 모킹하여 데이터가 렌더링되는지 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // /api/communities 요청을 모킹
    await page.route('**/api/communities?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          payload: {
            items: [
              {
                id: '1',
                name: '테스트 커뮤니티',
                desc: '테스트 커뮤니티 설명',
                url: 'test-youtube-id',
                createdAt: '2024-06-01T00:00:00Z',
                files: [
                  {
                    id: '1',
                    name: '테스트 커뮤니티 이미지',
                    caption: 1,
                    url: 'test-image-url'
                  }
                ]
              }
            ]
          }
        }),
      });
    });
    // 모킹된 데이터가 실제로 렌더링되는지 확인
    await expect(page.getByTestId('community-card-title')).toHaveText('테스트 커뮤니티');
    await expect(page.getByTestId('community-card-desc')).toHaveText('테스트 커뮤니티 설명');
  });
});