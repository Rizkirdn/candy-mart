// ... import api ...

export const productService = {
  // ... fungsi getAll, getOne, dll ...

  // TAMBAHKAN INI:
  checkout: async (items) => {
    const response = await api.post('/checkout', { items });
    return response.data;
  }
};