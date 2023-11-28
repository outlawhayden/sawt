"use client";

// Import necessary modules and components
import { supabase } from '../../lib/supabase/supabaseClient';
import ThreeCardLayout from '../../components/ThreeCardLayout';
// import NextButton from '@/components/NextButton';
import { useState, useEffect } from "react";
import { ICard } from '@/lib/api';

export const dynamic = "force-dynamic";
export const questionArray = ["A", "B", "C"];

export default function UserFeedback() {
  // const [currentIndex, setCurrentIndex] = useState<number>(randint(0,177));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cardArray, setCardArray] = useState<Array<ICard> | null>(null);

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  const handleNextClick = () => {
    if (currentIndex < questionArray.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  useEffect(() => {
    const getCards = async () => {
      try {
        const cardsArray = [];
        for (let i = 0; i < questionArray.length; i++) {
          const { data: cards, error } = await supabase
            .from('cards')
            .select('*')
            .eq("title", questionArray[i]);
            // .eq("questionID", currentIndex)


          if (error) {
            console.error("Error fetching cards: ", error);
            // Handle the error appropriately in your UI
          }
          cardsArray.push(cards);
        }
        setCardArray(cardsArray);
      } catch (error) {
        console.error("Error fetching cards: ", error);
        // Handle the error appropriately in your UI
      }
    };

    getCards();
  }, []); // Run this effect only once when the component mounts

  if (!cardArray) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ThreeCardLayout cards={cardArray[currentIndex]} />
      <div>
            <div className="float-left">
                <button onClick={handlePrevClick} className= "bg-blue-500 rounded bg-secondary px-4 py-2 text-white">Previous</button>
            </div>

            <div className="float-right">
                <button onClick={handleNextClick} className= "bg-blue-500 rounded bg-secondary px-4 py-2 text-white">Next</button>
            </div>    
        </div>
    </>
  );
}
