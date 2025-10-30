import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = 'http://localhost:4000'

  useEffect(() => {
    fetchProducts()
    const cartId = localStorage.getItem('currentCartId')
    if (cartId) {
      fetch(`${API_URL}/api/cart/${cartId}`)
        .then(res => res.json())
        .then(data => setCart(data))
        .catch(() => localStorage.removeItem('currentCartId'))
    }
  }, [])

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`)
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError('Failed to fetch products')
      console.error(err)
    }
  }
// Add to cart
const addToCart = async (productId, quantity) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qty: quantity })
      })
      
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('currentCartId', data.cartId)
        // Get updated cart data
        const cartResponse = await fetch(`${API_URL}/api/cart/${data.cartId}`)
        const cartData = await cartResponse.json()
        setCart(cartData)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to add to cart')
    } finally {
      setLoading(false)
    }
}

  // Delete cart
  const deleteCart = async () => {
    const cartId = localStorage.getItem('currentCartId')
    if (!cartId) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/cartdelete/${cartId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        localStorage.removeItem('currentCartId')
        setCart(null)
      }
    } catch (err) {
      setError('Failed to delete cart')
    } finally {
      setLoading(false)
    }
  }

  // Checkout
  const handleCheckout = async () => {
    const cartId = localStorage.getItem('currentCartId')
    if (!cartId) {
      setError('No cart to checkout')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/checkout/${cartId}`, {
        method: 'POST'
      })
      const data = await response.json()
      if (response.ok) {
        alert(
          `Checkout Receipt:\n` +
          `Product: ${data.invoice.productName}\n` +
          `Quantity: ${data.invoice.quantity}\n` +
          `Price per unit: ₹${data.invoice.pricePerUnit}\n` +
          `Total: ₹${data.invoice.total}\n` +
          `Time: ${new Date(data.invoice.timeStamp).toLocaleString()}`
        )
        localStorage.removeItem('currentCartId')
        setCart(null)
      }
    } catch (err) {
      setError('Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>E-Commerce Store</h1>
      </header>

      {error && <div className="error">{error}</div>}

      <main>
        <section className="products">
          <h2>Products</h2>
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <h3>{product.name}</h3>
                <p className="price">₹{product.price}</p>
                <div className="quantity-control">
                  <button 
                    onClick={(e) => {
                      const input = e.target.parentNode.querySelector('input')
                      if (input.value > 1) input.value = Number(input.value) - 1
                    }}
                  >-</button>
                  <input 
                    type="number" 
                    defaultValue={1} 
                    min={1}
                    onChange={(e) => {
                      if (e.target.value < 1) e.target.value = 1
                    }}
                  />
                  <button 
                    onClick={(e) => {
                      const input = e.target.parentNode.querySelector('input')
                      input.value = Number(input.value) + 1
                    }}
                  >+</button>
                </div>
                <button 
                  onClick={(e) => {
                    const quantity = Number(e.target.parentNode.querySelector('.quantity-control input').value)
                    addToCart(product._id, quantity)
                  }}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {cart && (
          <section className="cart">
            <h2>Cart</h2>
            <div className="cart-details">
              <p><strong>Product:</strong> {cart?.product?.name || 'N/A'}</p>
              <p><strong>Price:</strong> ₹{cart?.product?.price || 0}</p>
              <p><strong>Quantity:</strong> {cart?.quantity || 0}</p>
              <p><strong>Total Amount:</strong> ₹{cart?.totalAmount || 0}</p>
            </div>
            <div className="cart-actions">
              <button onClick={handleCheckout} disabled={loading}>
                {loading ? 'Processing...' : 'Checkout'}
              </button>
              <button onClick={deleteCart} disabled={loading} className="delete-btn">
                Clear Cart
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
