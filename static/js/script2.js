gsap.registerPlugin(ScrollTrigger);

// Animate the cards based on scroll position
ScrollTrigger.create({
    trigger: ".gallery", // Use the gallery as the trigger
    start: "top 80%", // Adjust as needed
    end: "bottom 20%", // Adjust as needed
    onUpdate: self => {
        // Calculate the horizontal scroll position
        const scrollX = self.getVelocity() * 100; // Adjust the multiplier as needed
        // Animate the cards
        gsap.to(".cards", { x: -scrollX, duration: 0.5, ease: "power3.out" });
    }
});
