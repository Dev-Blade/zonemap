import store from "store2";

export const getStorage = () => {
  return store.namespace("lootman");
};

// --------------------------------------------------------------------------------------------------------------------
export const loadFromStorage = (key: string): object => {
  const cart = getStorage();
  return cart(key);
};
export const saveToStorage = (key: string, content: object) => {
  const cart = getStorage();
  cart(key, content);
};
