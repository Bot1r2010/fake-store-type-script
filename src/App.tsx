import React, { useEffect, useState } from 'react';
import type { Product } from './types/types';
import { getProducts, createProduct, updateProduct, deleteProduct } from './services/api';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Product>({
    title: '',
    price: 0,
    description: '',
    category: 'electronic',
    image: 'https://i.imgur.com/ZANVnHE.jpeg',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch {
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const updated = await updateProduct(editingId, formData);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        const newProduct = await createProduct(formData);
        setProducts((prev) => [newProduct, ...prev]);
      }
      setFormData({
        title: '',
        price: 0,
        description: '',
        category: 'electronic',
        image: 'https://i.imgur.com/ZANVnHE.jpeg',
      });
    } catch {
      alert('Ошибка при сохранении');
    }
  };

  const handleEditClick = (product: Product) => {
    if (product.id) {
      setEditingId(product.id);
      setFormData({
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div className="container">
      <h1>Fake Store CRUD (Vite + TSX)</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <h2>{editingId !== null ? 'Редактировать товар' : 'Добавить товар'}</h2>
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Цена"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Категория"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="image"
          placeholder="Ссылка на картинку"
          value={formData.image}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Описание"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {editingId !== null ? 'Сохранить изменения' : 'Добавить'}
        </button>
        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', price: 0, description: '', category: '', image: '' });
            }}
          >
            Отмена
          </button>
        )}
      </form>

      {loading && <p>Загрузка...</p>}
      {error && <p className="error">{error}</p>}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.title} width={100} />
            <h3>{product.title}</h3>
            <p>Цена: ${product.price}</p>
            <p>{product.description}</p>
            <div className="actions">
              <button onClick={() => handleEditClick(product)}>Редактировать</button>
              <button onClick={() => product.id && handleDelete(product.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}