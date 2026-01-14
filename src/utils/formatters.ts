export const formatStatus = (status: string | undefined) => {
  if (!status) return '';
  const map: Record<string, string> = {
    ACTIVE: '正常',
    PENDING: '待审核',
    BANNED: '封禁'
  };
  return map[status] || status;
};

export const formatRole = (role: string | undefined) => {
  if (!role) return '';
  const map: Record<string, string> = {
    ADMIN: '管理员',
    USER: '普通用户'
  };
  return map[role] || role;
};

export const truncateText = (text: string | null | undefined, length = 30) => {
  if (!text) return '';
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};

export const formatDateTime = (timestamp: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
