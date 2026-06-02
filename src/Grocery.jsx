import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Grocery.css';

const Grocery = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  const groceryCategories = [
    { name: "Sauces and Spreads", image: "https://m.media-amazon.com/images/I/71BTzIOZGeL._UF1000,1000_QL80_.jpg" },
    { name: "Tea, Coffee and More", image: "https://5.imimg.com/data5/XV/VU/IJ/SELLER-2540804/tea-coffee-packaging-pouch.png" },
    { name: "Snacks", image: "https://images.pexels.com/photos/35363961/pexels-photo-35363961.jpeg" },
    { name: "vegetable", image: "https://images.pexels.com/photos/14650541/pexels-photo-14650541.jpeg" },
    { name: "dryfruits", image: "https://images.pexels.com/photos/5472169/pexels-photo-5472169.jpeg" },
    { name: "Soup", image: "https://images.pexels.com/photos/5820105/pexels-photo-5820105.jpeg" },
    { name: "Biscuits", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG1UWYAWJjD6fIHbFhDl28ERFL7HWXDQRvNw&s" },
    { name: "marinate", image: "https://images.pexels.com/photos/32421783/pexels-photo-32421783.jpeg" },
    { name: "Fruits", image: "https://mcprod.spencers.in/media/catalog/category/4403.png" },
    { name: "Snacks", image: "https://assets.aboutamazon.com/dims4/default/2e64665/2147483647/strip/false/crop/1280x720+0+0/resize/1280x720!/quality/90/?url=https%3A%2F%2Famazon-blogs-brightspot.s3.amazonaws.com%2F10%2F3c%2F5b7a5b74408b93c9af780b80f1f6%2Fbanner-snacks.jpg" },
    { name: "Milk", image: "https://rukminim2.flixcart.com/image/704/844/l0igvww0/milk/z/8/d/2-homogenised-toned-milk-1-l-carton-2pkt-tetrapack-toned-amul-original-imagcafrrb9fpryj.jpeg?q=90&crop=false" },
    { name: "Vegetables", image: "https://5.imimg.com/data5/SELLER/Default/2023/10/351724591/PJ/GB/YG/42452375/vegetable-500x500.jpg" },
    { name: "Masala", image: "https://keralaspicecart.com/wp-content/uploads/2020/10/kerala-spice-cart-garam-masala.jpg" },
    { name: "Breads", image: "https://www.bbassets.com/media/uploads/p/l/70001169_13-english-oven-bread-brown.jpg" },
    { name: "Chocolate", image: "https://rukminim2.flixcart.com/image/704/844/xif0q/chocolate/h/j/6/-original-imah2yr7ycffpx2v.jpeg?q=90&crop=false" },
    { name: "Ice-Cream", image: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/CIW/2024/11/13/476487c6-81fb-4239-bfda-de89df46a73d_456298_2.png" },
    { name: "Noodles", image: "https://m.media-amazon.com/images/I/71uUJ5EQY9L._UF894,1000_QL80_.jpg" },
    { name: "Cereals", image: "https://m.media-amazon.com/images/I/71JHjyYH40L._UF1000,1000_QL80_.jpg" }
  ];

  return (
    <section className="grocery-section">
      <div className="grocery-header-container">
        <div className="grocery-header">
          <button 
            className="scroll-arrow left-arrow" 
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FiChevronLeft />
          </button>
          <h2>Shop on Instamart</h2>
          <button 
            className="scroll-arrow right-arrow" 
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="grocery-scroll-container" ref={scrollRef}>
        <div className="grocery-grid">
          {groceryCategories.map((category, index) => (
            <div key={index} className="grocery-card">
              <div className="grocery-image-container">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="grocery-image"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/images/default.jpg';
                  }}
                />
              </div>
              <h3 className="grocery-title">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Grocery;