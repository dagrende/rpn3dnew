export default {
  // for three adjoining sphere with radius r1, r2, r3 and sphere 1 and 3 d13 apart on x axis,
  // spehere 2 should be result.x and result.y relative to sphere 1.
  threeSpheres(r1, r2, r3, d13) {
    let r12 = r1 + r2;
    let r23 = r2 + r3;
    let v1=Math.acos((r12 * r12 + d13 * d13 - r23 * r23) / (2 * r12 * d13));
    return {x: r12 * Math.cos(v1), y: r12 * Math.sin(v1)};
  }
}
