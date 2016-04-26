/**
    @file SvgDomIntersections
    @copyright 2015 Robert Benko (Quazistax)
    @license MIT
*/

// dependent on kld-intersections library
// https://github.com/Quazistax/kld-intersections

/// <reference path="lib/kld/Intersection.js" />
/// <reference path="lib/kld/IntersectionParams.js" />
/// <reference path="lib/kld/Point2D.js" />
/// <reference path="lib/kld/Matrix2D.js" />
/// <reference path="lib/svgjs/svg2.0.js" />

this.SvgDom = this.SvgDom || {};
(function () {
    var Ip = IntersectionParams;
    var IPTYPE = Ip.TYPE;
    var SD = SvgDom;
    
    ///////////////////////////////////////////////////////////////////
    /** 
        Finds intersection points between two SVG shapes.
                
        @param {SVGTransformable} shape1
        @param {SVGTransformable} shape2
        @param {SVGMatrix} [root_screenCTM_inverse]
        @returns {points:Array<SVGPoint>}
    */
    SD.intersectShapes = function (shape1, shape2, root_screenCTM_inverse) {
        var ip1 = (shape1 instanceof Ip) ? shape1 : Kld.getIntersectionParams(shape1);
        var ip2 = (shape2 instanceof Ip) ? shape2 : Kld.getIntersectionParams(shape2);

        var vim = root_screenCTM_inverse || SD.getRootScreenCTM(shape1).inverse();
        var m1 = Kld.convertSVGMatrix(vim.multiply(shape1.getScreenCTM()));
        var m2 = Kld.convertSVGMatrix(vim.multiply(shape2.getScreenCTM()));
        return {
            points: Intersection.intersectShapes(ip1, ip2, m1, m2).points.map(function (p) { return Kld.convertToSVGPoint(p); })
        };
    };

    SD.setCTM = function (element, m) {
        return element.transform.baseVal.initialize(
          element.ownerSVGElement.createSVGTransformFromMatrix(m));
    }

    SD.isIdentity = function (m) {
        return m.a === 1 &&
            m.b === 0 &&
            m.c === 0 &&
            m.d === 1 &&
            m.e === 0 &&
            m.f === 0;
    }

    SD.getViewportMatrix = function (element) {
        var hm = element.getTransformToElement(element.nearestViewportElement);
        var lm = element.getCTM();
        return lm.multiply(hm.inverse());
    }

    SD.getRootScreenCTM = function (element) {
        var root = element.farthestViewportElement || element;
        return root.getScreenCTM();
    }

    var ns = 'http://www.w3.org/2000/svg';
    var _svg = document.createElementNS(ns, 'svg');
   
    SD.createMatrix = function () {
        return _svg.createSVGMatrix();
    }

    SD.createPoint = function () {
        return _svg.createSVGPoint();
    }


    //// Kld specific ////

    var Kld = {};

    Kld.convertToSVGPoint = function (p) {
        var sp = SD.createPoint();
        sp.x = p.x;
        sp.y = p.y;
        return sp;
    }
    
    Kld.convertSVGMatrix = function (m) {
        if(SD.isIdentity(m))
            return Matrix2D.IDENTITY;
        return new Matrix2D(m.a, m.b, m.c, m.d, m.e, m.f);
    }  
    
    Kld.getIntersectionParams = function (element) {
	    var v = function (p) { return element[p].animVal.value; };
	    switch (element.nodeName) {
	        case 'rect':
	            if (v('rx') > 0 || v('ry') > 0) {
	                return Ip.newRoundRect(v('x'), v('y'), v('width'), v('height'), v('rx'), v('ry'));
	            }
	            else {
	                return Ip.newRect(v('x'), v('y'), v('width'), v('height'));
	            }
	            break;
	        case 'circle':
	            return Ip.newCircle(new Point2D(v('cx'), v('cy')), v('r'));
	        case 'ellipse':
	            return Ip.newEllipse(new Point2D(v('cx'), v('cy')), v('rx'), v('ry'));
	        case 'polygon':
	            return Ip.newPolygon(Kld.getPolygonPoints(element));
	        case 'polyline':
	            return Ip.newPolyline(Kld.getPolylinePoints(element));
	        case 'line':
	            return Ip.newLine(new Point2D(v('x1'), v('y1')), new Point2D(v('x2'), v('y2')));
	        case 'path':
	            return Ip.newPath(Kld.getPathParams(element));
	        default:
	            return null;
	    }
	};

    Kld.getIntersectionParamsForSegment = function (segments, index, offset, lastStart) {
	    var s = segments[index];
	    var previous = segments[index - 1];
	    var data;
	    switch (s.pathSegTypeAsLetter) {
	        case "A":
	            return Ip.newArc(offset, new Point2D(s.x, s.y), s.r1, s.r2, s.angle, s.largeArcFlag, s.sweepFlag);
	        case "a":
	            return Ip.newArc(offset, offset.add(new Point2D(s.x, s.y)), s.r1, s.r2, s.angle, s.largeArcFlag, s.sweepFlag);
	        case "H":
	            return Ip.newLine(offset, new Point2D(s.x, offset.y));
	        case "h":
	            return Ip.newLine(offset, offset.add(new Point2D(s.x, 0)));
	        case "V":
	            return Ip.newLine(offset, new Point2D(offset.x, s.y));
	        case "v":
	            return Ip.newLine(offset, offset.add(new Point2D(0, s.y)));
	        case "L":
	            return Ip.newLine(offset, new Point2D(s.x, s.y));
	        case "l":
	            return Ip.newLine(offset, offset.add(new Point2D(s.x, s.y)));
	        case "M":
	            throw new Error("Segment type has no intersection params: " + s.pathSegTypeAsLetter);
	        case "m":
	            throw new Error("Segment type has no intersection params: " + s.pathSegTypeAsLetter);
	        case "C":
	            return Ip.newBezier3(offset, (new Point2D(s.x1, s.y1)), (new Point2D(s.x2, s.y2)), (new Point2D(s.x, s.y)));
	        case "c":
	            return Ip.newBezier3(offset, offset.add(new Point2D(s.x1, s.y1)), offset.add(new Point2D(s.x2, s.y2)), offset.add(new Point2D(s.x, s.y)));
	        case "Q":
	            return Ip.newBezier2(offset, (new Point2D(s.x1, s.y1)), (new Point2D(s.x, s.y)));
	        case "q":
	            return Ip.newBezier2(offset, offset.add(new Point2D(s.x1, s.y1)), offset.add(new Point2D(s.x, s.y)));
	        case "S":
	            return Ip.newBezier3(offset, (new Point2D(s.x2, s.y2)), (new Point2D(s.x, s.y)));
	        case "s":
	            return Ip.newBezier3(offset, offset.add(new Point2D(s.x2, s.y2)), offset.add(new Point2D(s.x, s.y)));
	        case "T":
	            return Ip.newBezier2(offset, (new Point2D(s.x, s.y)));
	        case "t":
	            return Ip.newBezier2(offset, offset.add(new Point2D(s.x, s.y)));
	        case "Z":
	        case "z":
	            return Ip.newLine(offset, lastStart);
	            //var ip = new Ip(IPTYPE.LINE, [offset, lastStart]);
	            //ip.meta.closePath = true;
	            //return ip;
	        default: throw new Error("Unsupported segment type: " + s.pathSegTypeAsLetter);
	    }
	};

    Kld.getPathParams = function (path) {
	    var i, segments = [];
	    for (i = 0; i < path.pathSegList.numberOfItems; i++)
	        segments.push(path.pathSegList.getItem(i));
	    var offset = new Point2D(segments[0].x, segments[0].y);
	    var lastStart = offset;
	    var pathParams = [];
	    for (i = 1; i < segments.length; i++) {
	        switch (segments[i].pathSegTypeAsLetter) {
	            case 'm': case 'M':
	                break;
	            default:
	                pathParams.push(Kld.getIntersectionParamsForSegment(segments, i, offset, lastStart));
	        }

	        switch (segments[i].pathSegTypeAsLetter) {
	            case 'z': case 'Z':
	                offset = lastStart;
	                break;
	            case 'a': case 'm': case 'l': case 'c': case 'q': case 's': case 't':
	                offset = offset.add(new Point2D(segments[i].x, segments[i].y));
	                break;
	            case 'h':
	                offset = offset.add(new Point2D(segments[i].x, 0));
	                break;
	            case 'v':
	                offset = offset.add(new Point2D(0, segments[i].y));
	                break;
	            case 'H':
	                offset = new Point2D(segments[i].x, offset.y);
	                break;
	            case 'V':
	                offset = new Point2D(offset.x, segments[i].y);
	                break;
	            default:
	                offset = new Point2D(segments[i].x, segments[i].y);
	        }
	        switch (segments[i].pathSegTypeAsLetter) {
	            case 'm': case 'M':
	                lastStart = offset;
	                break;
	        }
	    }
	    return pathParams;
	};

    Kld.convertSVGPointList = function (points_list) {
	    var n = points_list.numberOfItems;
	    var points = [];
	    for (var i = 0; i < n; i++) {
	        points.push(new Point2D(points_list.getItem(i).x, points_list.getItem(i).y));
	    }
	    return points;
	};
    Kld.getPolylinePoints = function (polyline) {
        return Kld.convertSVGPointList(polyline.points);
	};
    Kld.getPolygonPoints = function (polygon) {
        return Kld.convertSVGPointList(polygon.points);
	};
 
}).call(this);