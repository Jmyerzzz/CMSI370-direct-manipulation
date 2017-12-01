($ => {
    let drawingMap = new Map();
    let movingMap = new Map();

    let startDraw = function(event) {
        $.each(event.changedTouches, function (index, touch) {
            if (!touch.target.movingBox) {
                touch.target.anchorX = touch.pageX;
                touch.target.anchorY = touch.pageY;
                let position = { left: touch.target.anchorX, top: touch.target.anchorY };

                let drawingBox = $("<div></div>")
                    .appendTo($("#drawing-area"))
                    .addClass("box")
                    .data({
                        position: position,
                        velocity: { x: 0, y: 0, z: 0 },
                        acceleration: { x: 0, y: 0, z: 0 }
                    })
                    .bind("touchstart", startMove)
                    .bind("touchmove", trackDrag)
                    .bind("touchend", endDrag)
                    .bind("touchend", unhighlight)
                    .bind("touchstart", inflate)
                    .offset(position);
                drawingMap.set(touch.identifier, drawingBox);
            }

        });
        event.preventDefault();
    };

    let inflate = function(event) {
        $.each(event.changedTouches, function (index, touch) {
            let width = parseInt($(touch.target).css("width")) + 15;
            let height = parseInt($(touch.target).css("height")) + 15;
            if (width >= 250) {
                $(touch.target).remove();
            }
            $(touch.target).css('width', width);
            $(touch.target).css('height', height);
        });
        event.preventDefault();
    };

    /**
     * Tracks a box as it is rubberbanded or moved across the drawing area.
     * Note how we can use arrow function notation here because we don't need
     * the `this` variable in this implementation.
     */
    let trackDrag = function(event) {
        $.each(event.changedTouches, function (index, touch) {
            // Don't bother if we aren't tracking anything.
            if (movingMap.has(touch.identifier)) {
                // Reposition the object.
                let newPosition = {
                    left: touch.pageX - touch.target.deltaX,
                    top: touch.pageY - touch.target.deltaY
                };

                // This form of `data` allows us to update values one attribute at a time.
                $(touch.target).data('position', newPosition);
                touch.target.movingBox.offset(newPosition);
            } else if (drawingMap.has(touch.identifier)) {
                let position = {
                    left: (touch.target.anchorX < touch.pageX) ? touch.target.anchorX : touch.pageX,
                    top: (touch.target.anchorY < touch.pageY) ? touch.target.anchorY : touch.pageY
                };
                drawingMap.get(touch.identifier)
                    .width((Math.abs(touch.pageY - touch.target.anchorY) + Math.abs(touch.pageX - touch.target.anchorX)) / 2)
                    .height((Math.abs(touch.pageY - touch.target.anchorY) + Math.abs(touch.pageX - touch.target.anchorX)) / 2)
                    .data({ position: position })
                    .offset(position);
            }
        });

        // Don't do any touch scrolling.
        event.preventDefault();
    };

    /**
     * Concludes a drawing or moving sequence.
     */
    let endDrag = event => {
        $.each(event.changedTouches, (index, touch) => {
            if (touch.target.movingBox) {
                // Change state to "not-moving-anything" by clearing out
                // touch.target.movingBox.
                touch.target.movingBox = null;
                movingMap.delete(touch.identifier);
            } else if (touch.target.drawingBox) {
                drawingMap.delete(touch.identifier);
                touch.target.drawingBox
                    .touchmove(trackDrag)
                    .touchend(unhighlight)
                    .touchstart(startMove);
                touch.target.drawingBox = null;
            }
        });
        event.preventDefault();
    };

    /**
     * Indicates that an element is unhighlighted.
     */
    let unhighlight = event => $(event.currentTarget).removeClass("box-highlight");

    /**
     * Begins a box move sequence.
     */
    let startMove = event => {
        $.each(event.changedTouches, (index, touch) => {
            movingMap.set(touch.identifier, touch.target);

            // Highlight the element.
            $(touch.target).addClass("box-highlight");

            // Take note of the box's current (global) location. Also, set its velocity and acceleration to
            // nothing because, well, _finger_.
            let targetBox = $(touch.target);
            let startOffset = targetBox.offset();
            targetBox.data({
                position: startOffset,
                velocity: { x: 0, y: 0, z: 0 },
                acceleration: { x: 0, y: 0, z: 0 }
            });

            // Set the drawing area's state to indicate that it is
            // in the middle of a move.
            touch.target.movingBox = targetBox;
            touch.target.deltaX = touch.pageX - startOffset.left;
            touch.target.deltaY = touch.pageY - startOffset.top;
        });

        // Eat up the event so that the drawing area does not
        // deal with it.
        event.stopPropagation();
        event.preventDefault();
    };

    /**
     * The motion update routine.
     */
    const FRICTION_FACTOR = 0.99;
    const ACCELERATION_COEFFICIENT = 0.05;
    const BUOYANCY = -.2;
    const FRAME_RATE = 120;
    const FRAME_DURATION = 1000 / FRAME_RATE;

    let lastTimestamp = 0;
    let updateBoxes = timestamp => {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        // Keep that frame rate under control.
        if (timestamp - lastTimestamp < FRAME_DURATION) {
            window.requestAnimationFrame(updateBoxes);
            return;
        }

        $("div.box").each((index, element) => {
            let $element = $(element);

            // If it's highlighted, we don't accelerate it because it is under a finger.
            if ($element.hasClass("box-highlight")) {
                return;
            }

            // Note how we base all of our calculations from the _model_...
            let s = $element.data('position');
            let v = $element.data('velocity');
            let a = $element.data('acceleration');

            // The standard update-bounce sequence.
            s.left += v.x;
            s.top -= v.y;

            v.x += (a.x * ACCELERATION_COEFFICIENT * BUOYANCY);
            v.y += (a.y * ACCELERATION_COEFFICIENT * BUOYANCY);
            v.z += (a.z * ACCELERATION_COEFFICIENT * BUOYANCY);

            v.x *= FRICTION_FACTOR;
            v.y *= FRICTION_FACTOR;
            v.z *= FRICTION_FACTOR;

            let $parent = $element.parent();
            let bounds = {
                left: $parent.offset().left,
                top: $parent.offset().top
            };

            bounds.right = bounds.left + $parent.width();
            bounds.bottom = bounds.top + $parent.height();

            if ((s.left <= bounds.left) || (s.left + $element.width() > bounds.right)) {
                s.left = (s.left <= bounds.left) ? bounds.left : bounds.right - $element.width();
                v.x = -v.x / 1.25;
            }

            if ((s.top <= bounds.top) || (s.top + $element.height() > bounds.bottom)) {
                s.top = (s.top <= bounds.top) ? bounds.top : bounds.bottom - $element.height();
                v.y = -v.y / 1.25;
            }

            // ...and the final result is sent on a one-way trip to the _view_.
            $(element).offset(s);
        });

        lastTimestamp = timestamp;
        window.requestAnimationFrame(updateBoxes);
    };

    /**
     * Sets up the given jQuery collection as the drawing area(s).
     */
    let setDrawingArea = jQueryElements => {
        // Set up any pre-existing box elements for touch behavior.
        jQueryElements
            .addClass("drawing-area")

            // Event handler setup must be low-level because jQuery
            // doesn't relay touch-specific event properties.
            .each((index, element) => {
                $(element)
                    .bind("touchmove", trackDrag)
                    .bind("touchstart", startDraw)
                    .bind("touchend", endDrag);
            })

            .find("div.box").each((index, element) => {
                $(element)
                    .bind("touchstart", startMove)
                    .bind("touchstart", inflate)
                    .bind("touchend", unhighlight)
                    .data({
                        position: $(element).offset(),
                        velocity: { x: 0, y: 0, z: 0 },
                        acceleration: { x: 0, y: 0, z: 0 }
                    });
            });

        // In this sample, device acceleration is the _sole_ determiner of a box's acceleration.
        window.ondevicemotion = event => {
            let a = event.accelerationIncludingGravity;
            $("div.box").each((index, element) => {
                $(element).data('acceleration', a);
            });
        };

        // Start the animation sequence.
        window.requestAnimationFrame(updateBoxes);
    };

    // No arrow function here because we don't want lexical scoping.
    $.fn.boxesWithPhysics = function () {
        setDrawingArea(this);
        return this;
    };
})(jQuery);
