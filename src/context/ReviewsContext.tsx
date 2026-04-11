'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Review {
    id: string;
    productId: string;
    productName: string;
    rating: number;
    comment: string;
    date: string;
    userEmail: string;
    userName: string;
}

interface ReviewsContextType {
    reviews: Review[];
    addReview: (review: Omit<Review, 'id' | 'date'>) => void;
    getReviewsForProduct: (productId: string) => Review[];
    getReviewsForUser: (email: string) => Review[];
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [mounted, setMounted] = useState(false);

    // Initial load from real API (fallback to local if API is not yet ready)
    useEffect(() => {
        setMounted(true);
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/reviews');
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                } else {
                    // Fallback to local storage if API is missing
                    const saved = localStorage.getItem('reviews');
                    if (saved) setReviews(JSON.parse(saved));
                }
            } catch (e) {
                const saved = localStorage.getItem('reviews');
                if (saved) setReviews(JSON.parse(saved));
            }
        };
        fetchReviews();
    }, []);

    const addReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
        const newReview: Review = {
            ...reviewData,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toLocaleDateString(),
        };

        // UI Optimistic update
        setReviews(prev => [newReview, ...prev]);
        
        // Save to real database
        try {
            await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });
        } catch (e) {
            console.error('Failed to sync review with database');
            // Persist locally as fallback
            const updated = [newReview, ...reviews];
            localStorage.setItem('reviews', JSON.stringify(updated));
        }
    };

    const getReviewsForProduct = (productId: string) => {
        return reviews.filter(r => r.productId === productId);
    };

    const getReviewsForUser = (userEmail: string) => {
        return reviews.filter(r => r.userEmail === userEmail);
    };

    return (
        <ReviewsContext.Provider value={{ reviews, addReview, getReviewsForProduct, getReviewsForUser }}>
            {children}
        </ReviewsContext.Provider>
    );
}

export function useReviews() {
    const context = useContext(ReviewsContext);
    if (context === undefined) {
        throw new Error('useReviews must be used within a ReviewsProvider');
    }
    return context;
}
