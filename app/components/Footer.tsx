import React from 'react';
import Card from './Card';
import { testimonials } from '../constants/testimonials';

const Footer = () => {
  return (
    <footer>
      <div className="bg-[#EAE4DA] h-[100px] my-10 flex items-center justify-center text-4xl font-semibold">
        <h1>More Trusted Customer Reviews</h1>
      </div>

     {/* <div className="max-w-[1300px] mx-auto flex flex-wrap justify-center items-start gap-x-2 gap-y-5"> */}
<div className="columns-[300px] space-y-4 max-w-[1300px] mx-auto ">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            name={testimonial.name}
            url={testimonial.url}
            text={testimonial.text}
          />
        ))}
      </div>
    </footer>
  );
};

export default Footer;
