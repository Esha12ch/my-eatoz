import React, { useEffect, useRef } from 'react';
import './FoodCategories.css';

const FoodCategories = () => {
  const foodCategories = [
 { id: 1, name: "Paratha", image: "https://www.whiskaffair.com/wp-content/uploads/2020/06/Aloo-Paratha-2-3-500x500.jpg" },
    { id: 2, name: "Biryani", image: "https://c.ndtvimg.com/2022-04/fq5cs53_biryani-doubletree-by-hilton_625x300_12_April_22.jpg" },
    { id: 3, name: "Chole Bhature", image: "https://www.spiritofindiapattaya.com/wp-content/uploads/2018/08/Chhola-Bhatura-1.jpg" },
    { id: 4, name: "Burger", image: "https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2021/09/beef-burger.jpg?im=AspectCrop=(16,9);" },
    { id: 5, name: "Pizza", image: "https://b.zmtcdn.com/data/pictures/chains/6/120096/ce0341e58cf96f163101b4dff77ed938.jpg?fit=around|750:500&crop=750:500;*,*" },
    { id: 6, name: "Rolls", image: "https://blessmyfoodbypayal.com/wp-content/uploads/2024/11/IMG_5245.png" },
    { id: 7, name: "Chinese", image: "https://s3-media0.fl.yelpcdn.com/bphoto/5VR_OpRe1YjTrvzcb24B-Q/1000s.jpg" },
    { id: 8, name: "North Indian", image: "https://www.sodhatravel.com/hubfs/Thali.jpg" },
    { id: 9, name: "Khichdi", image: "https://foodtrails25.com/wp-content/uploads/2019/04/Yellow-Moong-Dal-Khichdi-Recipe.jpg" },
    { id: 10, name: "Pav Bhaji", image: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Instant-Pot-Mumbai-Pav-Bhaji-Recipe.jpg" },
    { id: 11, name: "sweets", image: "https://www.eg2i.com/uploads/product_image/product_795_1.jpg" },
    { id: 12, name: "South Indian", image: "https://assets.vogue.com/photos/63d169f727f1d528635b4287/3:2/w_3630,h_2420,c_limit/GettyImages-1292563627.jpg" },
    { id: 13, name: "Cakes", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8UU0kQBpl2T9gzj39bGMMJGn1dqTj2TrCZtWCT6dFXmjSzTo0Yu0fSLPS85rNaR60PY0&usqp=CAU" },
    { id: 14, name: "coffee", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPVnUgGP6ADE_fnololFjuynqQOuCrCdwS1w&s" }

  ];

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const scrollSpeed = 50;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = [...foodCategories, ...foodCategories].map((category, index) => (
      `<div class="category-card" key="${category.id}-${index}">
        <div class="image-container">
          <img src="${category.image}" alt="${category.name}" 
            onerror="this.src='/images/food-placeholder.jpg'"/>
          <div class="order-overlay">
            <button class="order-button">
              <span class="order-text">Order Now</span>
              <span class="gradient-shine"></span>
            </button>
          </div>
        </div>
        <h3 class="category-name">${category.name}</h3>
      </div>`
    )).join('');

    container.innerHTML = items;

    let scrollPosition = 0;
    const itemWidth = 240;
    const totalWidth = itemWidth * foodCategories.length;

    const animate = () => {
      scrollPosition += scrollSpeed / 60;
      if (scrollPosition >= totalWidth) scrollPosition = 0;
      container.style.transform = `translateX(-${scrollPosition}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <section className="food-categories">
      <div className="container">
        <h2 className="section-title">Delicious Categories</h2>
        
        <div className="carousel-viewport">
          <div className="carousel-track" ref={containerRef} />
        </div>
      </div>
    </section>
  );
};

export default FoodCategories;