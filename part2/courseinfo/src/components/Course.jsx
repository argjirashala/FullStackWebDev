// Header, Part were taken from the solution in submission system
const Header = ({ course }) => <h2>{course}</h2>;

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
);

const Content = ({ parts }) => (
  <>
    {parts.map(part => (
      <Part key={part.id} part={part} />
    ))}
  </>
)

const Total = ({ parts }) => {
  const totalExercises = parts.reduce((sum, part) => sum + part.exercises, 0);
  return <p><strong>total of {totalExercises} exercises</strong></p>;
}


const Course = ({ course }) => (
  <div>
    <Header course={course.name} />
    <Content parts={course.parts} />
    <Total parts={course.parts} />
  </div>
)

export default Course;