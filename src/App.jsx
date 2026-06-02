import React, { useState } from "react";
import "./App.css";

import Header from "./Header";
import HeroSection from "./HeroSection";
import Services from "./Services";
import FoodCategories from "./FoodCategories";
import Grocery from "./Grocery";
import RestaurantSection from "./RestaurantSection";
import Banner from "./Banner";
import CitySection from "./CitySection";
import Footer from "./Footer";

import About from "./About";
import OffersPage from "./Offerspage";
import ReviewsPage from "./Reviewspage";

import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";

import FoodMenu from "./FoodMenu";
import CartPage from "./CartPage";
import PaymentPage from "./PaymentPage";

// ✅ Admin
import AdminApp from "./Adminapp";

function App() {
  const [user] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [paymentTotal, setPaymentTotal] = useState(0);

  // ✅ Admin page — full takeover, no header
  if (page === "admin") {
    return <AdminApp onExitAdmin={() => setPage("home")} />;
  }

  return (
    <div className="app-container">

      <Header
        openAbout={() => setPage("about")}
        openOffers={() => setPage("offers")}
        openReviews={() => setPage("reviews")}
        openCart={() => setPage("cart")}
        goHome={() => setPage("home")}
        openAdmin={() => setPage("admin")} // ✅
        cartCount={cart.reduce((a, b) => a + (b.qty || 0), 0)}
      />

      {page === "payment" ? (
        <PaymentPage
          amount={paymentTotal}
          goBack={() => setPage("cart")}
          onSuccess={() => { setCart([]); setPage("home"); }}
        />

      ) : page === "cart" ? (
        <CartPage
          cart={cart}
          setCart={setCart}
          user={user}
          goBack={() => setPage("home")}
          openPayment={(amount) => { setPaymentTotal(amount); setPage("payment"); }}
        />

      ) : page === "menu" ? (
        <FoodMenu
          brand={selectedBrand}
          goBack={() => setPage("page1")}
          cart={cart}
          setCart={setCart}
          user={user}
        />

      ) : page === "page1" ? (
        <Page1
          goHome={() => setPage("home")}
          openMenu={(brand) => { setSelectedBrand(brand); setPage("menu"); }}
          user={user}
        />

      ) : page === "page2" ? (
        <Page2
          goHome={() => setPage("home")}
          cart={cart}
          setCart={setCart}
          user={user}
          openCart={() => setPage("cart")}
        />

      ) : page === "page3" ? (
        <Page3 goHome={() => setPage("home")} />

      ) : page === "about" ? (
        <About goHome={() => setPage("home")} />

      ) : page === "offers" ? (
        <OffersPage goHome={() => setPage("home")} />

      ) : page === "reviews" ? (
        <ReviewsPage onClose={() => setPage("home")} />

      ) : (
        <>
          <HeroSection />
          <Services
            openPage1={() => setPage("page1")}
            openPage2={() => setPage("page2")}
            openPage3={() => setPage("page3")}
          />
          <FoodCategories />
          <Grocery />
          <RestaurantSection />
          <Banner />
          <CitySection />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;