/**
 * MCP 키 관리 컴포넌트
 */
import React, { useEffect, useState } from 'react';
import { mcpApi } from '../api/mcpApi';
import type { MCPProvider, MCPKeyResponse } from '../types/mcp.types';

interface KeyFormData {
  provider_id: string;
  display_name: string;
  description: string;
  bot_id: string;
  keys: Record<string, string>;
}

export const MCPKeyManagement: React.FC = () => {
  const [providers, setProviders] = useState<MCPProvider[]>([]);
  const [keys, setKeys] = useState<MCPKeyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<MCPProvider | null>(
    null
  );
  const [formData, setFormData] = useState<KeyFormData>({
    provider_id: '',
    display_name: '',
    description: '',
    bot_id: '',
    keys: {},
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersData, keysData] = await Promise.all([
        mcpApi.getProviders(),
        mcpApi.listKeys(),
      ]);
      setProviders(providersData);
      setKeys(keysData.keys);
    } catch (error) {
      console.error('Failed to load MCP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('정말 이 키를 삭제하시겠습니까?')) return;

    try {
      await mcpApi.deleteKey(keyId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete key:', error);
      alert('키 삭제에 실패했습니다.');
    }
  };

  const openAddKeyModal = (provider: MCPProvider) => {
    setSelectedProvider(provider);
    setFormData({
      provider_id: provider.provider_id,
      display_name: '',
      description: '',
      bot_id: '',
      keys: {},
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
    setFormData({
      provider_id: '',
      display_name: '',
      description: '',
      bot_id: '',
      keys: {},
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.display_name.trim()) {
      errors.display_name = '키 이름을 입력해주세요.';
    }

    if (selectedProvider) {
      selectedProvider.required_keys.forEach((keyInfo) => {
        const keyValue = formData.keys[keyInfo.key_name];
        if (!keyValue || !keyValue.trim()) {
          errors[`key_${keyInfo.key_name}`] = `${keyInfo.display_name}을(를) 입력해주세요.`;
        } else if (
          keyInfo.validation_pattern &&
          !new RegExp(keyInfo.validation_pattern).test(keyValue)
        ) {
          errors[`key_${keyInfo.key_name}`] = `${keyInfo.display_name} 형식이 올바르지 않습니다.`;
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await mcpApi.createKey({
        provider_id: formData.provider_id,
        display_name: formData.display_name,
        description: formData.description || undefined,
        bot_id: formData.bot_id || null,
        keys: formData.keys,
      });

      alert('키가 성공적으로 등록되었습니다.');
      closeModal();
      await loadData();
    } catch (error: any) {
      console.error('Failed to create key:', error);
      alert(
        error?.response?.data?.message ||
          '키 등록에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyInputChange = (keyName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keys: {
        ...prev.keys,
        [keyName]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="mcp-key-management p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        MCP 키 관리
      </h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          등록된 키 ({keys.length})
        </h2>
        <div className="key-list space-y-3">
          {keys.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              등록된 키가 없습니다.
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.key_id}
                className="key-item bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="key-header flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {key.display_name}
                  </h3>
                  <span className="provider-badge px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {key.provider_name}
                  </span>
                </div>
                <div className="key-info text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>등록된 키: {key.keys_registered.join(', ')}</p>
                  <p>소유자: {key.user_email}</p>
                  <p>
                    마지막 사용:{' '}
                    {key.last_used_at
                      ? new Date(key.last_used_at).toLocaleString()
                      : '사용 기록 없음'}
                  </p>
                </div>
                <div className="key-actions mt-3">
                  <button
                    onClick={() => handleDeleteKey(key.key_id)}
                    className="btn-delete px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          사용 가능한 제공자
        </h2>
        <div className="provider-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.provider_id}
              className="provider-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{provider.icon}</span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {provider.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {provider.description}
              </p>
              <button
                onClick={() => openAddKeyModal(provider)}
                className="btn-add px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded w-full"
              >
                키 추가
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 키 추가 모달 */}
      {isModalOpen && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedProvider.icon} {selectedProvider.name} 키 추가
              </h3>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 키 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  키 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="예: 프로덕션 YouTube 키"
                  disabled={isSubmitting}
                />
                {formErrors.display_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.display_name}
                  </p>
                )}
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  설명 (선택)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={2}
                  placeholder="키에 대한 설명을 입력하세요"
                  disabled={isSubmitting}
                />
              </div>

              {/* 봇 ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  봇 ID (선택)
                </label>
                <input
                  type="text"
                  value={formData.bot_id}
                  onChange={(e) =>
                    setFormData({ ...formData, bot_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="특정 봇에만 제한하려면 봇 ID 입력"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  비워두면 모든 봇에서 사용 가능합니다.
                </p>
              </div>

              {/* API 키 입력 */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  필수 키
                </h4>
                {selectedProvider.required_keys.map((keyInfo) => (
                  <div key={keyInfo.key_name} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {keyInfo.display_name}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={keyInfo.is_secret ? 'password' : 'text'}
                      value={formData.keys[keyInfo.key_name] || ''}
                      onChange={(e) =>
                        handleKeyInputChange(keyInfo.key_name, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                      placeholder={keyInfo.description}
                      disabled={isSubmitting}
                    />
                    {formErrors[`key_${keyInfo.key_name}`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors[`key_${keyInfo.key_name}`]}
                      </p>
                    )}
                    {keyInfo.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {keyInfo.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                >
                  {isSubmitting ? '등록 중...' : '키 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
