// 初始化 WorkBuddy 云服务客户端（CDN 形式，纯 HTML 站点用）
window.HESIN_cloud = null;
function getCloud() {
  if (window.HESIN_cloud) return window.HESIN_cloud;
  const { endpoint, publishableKey, oauthRelayBaseUrl } = window.HESIN_CLOUD;
  window.HESIN_cloud = WorkBuddyCloud.createWorkBuddyCloud({ endpoint, publishableKey, oauthRelayBaseUrl });
  return window.HESIN_cloud;
}
