import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Story from "@/components/Story";
import Products from "@/components/Products";
import Flavors from "@/components/Flavors";
import Ingredients from "@/components/Ingredients";
import FireList from "@/components/FireList";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Story />
        <Products />
        <Flavors />
        <Ingredients />
        <FireList />
      </main>
      <Footer />
    </>
  );
}
