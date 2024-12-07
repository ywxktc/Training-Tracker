import { SuccessResponse, ErrorResponse } from "@/types/Response";
import type { Response } from "@/types/Response";

const setItem = <T>(key: string, value: T): Response<T> => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return SuccessResponse(value);
  } catch (error) {
    return ErrorResponse(`Failed to set item: ${error}`);
  }
};

const getItem = <T>(key: string): Response<T> => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return ErrorResponse("Item not found");
    }
    return SuccessResponse<T>(JSON.parse(item));
  } catch (error) {
    return ErrorResponse(`Failed to get item: ${error}`);
  }
};

const updateItem = <T>(
  key: string,
  updater: (prev: T | null) => T
): Response<T> => {
  try {
    const current = getItem<T>(key);
    const newValue = updater(current.success ? current.data : null);
    return setItem(key, newValue);
  } catch (error) {
    return ErrorResponse(`Failed to update item: ${error}`);
  }
};

const removeItem = (key: string): Response<void> => {
  try {
    localStorage.removeItem(key);
    return SuccessResponse(undefined);
  } catch (error) {
    return ErrorResponse(`Failed to remove item: ${error}`);
  }
};

const clearAll = (): Response<void> => {
  try {
    localStorage.clear();
    return SuccessResponse(undefined);
  } catch (error) {
    return ErrorResponse(`Failed to clear storage: ${error}`);
  }
};

const getAllKeys = (): Response<string[]> => {
  try {
    return SuccessResponse(Object.keys(localStorage));
  } catch (error) {
    return ErrorResponse(`Failed to get keys: ${error}`);
  }
};

const hasKey = (key: string): Response<boolean> => {
  try {
    return SuccessResponse(localStorage.getItem(key) !== null);
  } catch (error) {
    return ErrorResponse(`Failed to check key: ${error}`);
  }
};

export {
  setItem,
  getItem,
  updateItem,
  removeItem,
  clearAll,
  getAllKeys,
  hasKey,
};
