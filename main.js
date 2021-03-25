var eventBus = new Vue()


// product-review
Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

    <p v-if="errors.length">
        <b>Please correct the following error(s)</b>
        <ul>
            <li v-for="error in errors"> {{error}}</li>
        </ul>
    </p>

    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name" placeholder="name">
    </p>
    
    <p>
      <label for="review">Review:</label>      
      <textarea id="review" v-model="review"></textarea>
    </p>
    
    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>

    <p>Would you recommend this product?</p>
    
    <p>
      <label for="rec-yes">yes</label>
      <input v-model="recommendation" type="radio" name="recommendation" id="rec-yes" value="yes">
    </p>
    <p>
      <label for="rec-no">no</label>
      <input v-model="recommendation" type="radio" name="recommendation"  id="rec-no" value="no">
    </p>
    
    <p>
      <input type="submit" value="Submit">  
    </p>    
  
  </form-group>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommendation: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommendation) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                }
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommendation = null;
            }
            if (!this.name) this.errors.push("Name required");
            if (!this.rating) this.errors.push("Rating required");
            if (!this.review) this.errors.push("Review required");
            if (!this.recommendation) this.errors.push("Recommendation required");

        }
    }
})

// product - size
Vue.component('product-size', {
    props: {
        sizes: {
            type: Array,
            required: true
        }
    },
    template: `
    
            <ul class="size-inline">
                <li v-for="size in sizes"> {{size}} </li>
            </ul>
    `
})

//product-details challenge
Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }

    },
    template: `
    <div>
        <h1>{{title}}</h1>
        <ul>
            <li v-for="detail in details">{{detail}}</li>
        </ul>
    </div>
    `
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
            <div class="product-image">
                <a :href="socksUrl"><img :src="image" :alt="altText" /></a>
            </div>

            <div class="product-info">
                <h1>{{title}}</h1>

                <p v-if="inStock">In Stock</p>
                <p v-else :class="{outOfStock: !inStock}">Out of Stock</p>
                <p>{{sale}}</p>
                <p>User is premium: {{premium}}</p>
                <p>Shipping: {{shipping}}</p>
                <product-details :details="details" :title="item"></product-details>

                <product-size :sizes="sizes"></product-size>

                <div class="color-box" v-for="(variant, index) in variants" :key="variant.variantId" :style="{backgroundColor: variant.variantColor}" @mouseover=" updateProduct(index)">

                </div>
                <div class="cartItemQuantity">
                    <button v-on:click="addToCart" :disabled="!inStock" :class="{disabledButton:!inStock}">Add to cart</button>
                    <button @click="removeFromCart">Remove from cart</button>
                    
                </div>
            
            </div>

            <product-tabs :reviews="reviews"></product-tabs>

        </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ["80% cotton", "20% polyester", "Gender-neutral"],
            socksUrl: "https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg",
            onSale: true,
            variants: [{
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 5
                }
            ],
            reviews: [],
            sizes: ["S", "M", "L", "XL", "XLL"],
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },


    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale!';
            }
            return this.brand + ' ' + this.product + ' are not on sale!';
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99;
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        })
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
                :class="{activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs" :key="index"
                @click="selectedTab = tab">
                {{tab}}
            </span>

            <div v-show="selectedTab === 'Reviews'">
                
                <p v-if="!reviews.length">There is no reviews yet</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{review.name}}</p>
                        <p>Rating: {{review.rating}}</p>
                        <p>{{review.review}}</p>
                        <p>Recommend: {{review.recommendation}}</p>
                    </li>
                </ul>
            </div>
            
            <product-review v-show="selectedTab === 'Make a Review'"></product-review>


        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})


var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeItem(id) {
            for (var i = this.cart.length - 1; i >= 0; i--) {
                if (this.cart[i] === id) {
                    this.cart.splice(i, 1);
                }
            }
        }
    }
});