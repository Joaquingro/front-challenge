import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import axios from 'axios';


const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const parentRef = useRef(null);
  const moveableRef = useRef(null);

  const fetchImage = async () => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/photos');
      const photos = response.data;
      const randomIndex = Math.floor(Math.random() * photos.length);
      const randomPhoto = photos[randomIndex];
      const imageUrl = randomPhoto.url;
      const COLORS = imageUrl;
      return imageUrl;
    } catch (error) {
      console.log('Error fetching image:', error);
    }
  };
  

  const addMoveable = async () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    const imageUrl = await fetchImage();
    console.log(imageUrl);
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        imageUrl: imageUrl,
        originalWidth: 100,
        originalHeight: 100,
      },
    ]);
  };
  
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleDelete = (index) => {
    const updatedComponents = [...moveableComponents];
    updatedComponents.splice(index, 1);
    setMoveableComponents(updatedComponents);
  };
  
  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    
    // Save the initial left and width values of the moveable component
    if (handlePosX === -1) {
      const initialLeft = e.left;
      const initialWidth = e.width;
      const initialTop = e.top;
      const initialHeight = e.height;
  
      const onResize = (resizeEvent) => {
        const newWidth = resizeEvent.width;
        const newHeight = resizeEvent.height;
        const widthDiff = newWidth - initialWidth;
        const heightDiff = newHeight - initialHeight;
        const topDiff = resizeEvent.top - initialTop;
        const leftDiff = resizeEvent.left - initialLeft;
        const newLeft = initialLeft + leftDiff;
        const newTop = initialTop + topDiff;
  
        const parentElement = parentRef.current;
        const parentRect = parentElement.getBoundingClientRect();
        const leftLimit = parentRect.left;
        const topLimit = parentRect.top;
        const rightLimit = parentRect.right - newWidth;
        const bottomLimit = parentRect.bottom - newHeight;
  
        let limitedLeft = Math.max(leftLimit, Math.min(newLeft, rightLimit));
        let limitedTop = Math.max(topLimit, Math.min(newTop, bottomLimit));
  
        updateMoveable(index, {
          left: limitedLeft,
          top: limitedTop,
          width: newWidth,
          height: newHeight,
        });
      };
  
  

  
      moveableRef.current.on("resize", onResize);
    } else if (handlePosY === -1) {
      const initialTop = e.top;
      const initialHeight = e.height;
      const initialLeft = e.left;
      const initialWidth = e.width;
  
      const onResize = (resizeEvent) => {
        const newHeight = resizeEvent.height;
        const newTop = resizeEvent.top;
        const heightDiff = newHeight - initialHeight;
        const topDiff = newTop - initialTop;
        const newLeft = initialLeft;
        const newWidth = initialWidth;
  
        const parentElement = parentRef.current;
        const parentRect = parentElement.getBoundingClientRect();
        const topLimit = parentRect.top;
        const bottomLimit = parentRect.bottom - newHeight;
        const leftLimit = parentRect.left;
        const rightLimit = parentRect.right;
  
        let limitedTop = Math.max(topLimit, Math.min(newTop, bottomLimit));
        let limitedLeft = Math.max(leftLimit, Math.min(newLeft, rightLimit));
  
        updateMoveable(index, {
          top: limitedTop,
          left: limitedLeft,
          width: newWidth,
          height: newHeight,
        });
      };
  
      moveableRef.current.on("resize", onResize);
    }
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
          overflow: "hidden",
        }}
      >
        {moveableComponents.map((item, index) => (
          <div zIndex = "9999" style={{ position: "relative"}} 
          >
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              background: `url(${item.imageUrl})`,
            }}
          />
           
          <button
             style={{
              position: "absolute",
              left: item.left + item.width + 10, 
              top: item.top,
            }}
            onClick={() => handleDelete(index)}
          >
            X
          </button>
        </div>
            ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          overflow: "hidden"
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
