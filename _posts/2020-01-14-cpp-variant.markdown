---
layout: post
title:  "C++ Variant"
date:   2020-01-14 03:00:00 -0500
<!-- categories:  -->
excerpt: It's a bird.. It's a plane... It's... std::variant?
---
I haven't used unions in C++ because they're just not intuitive enough to me. They're horrendous to write and a pain to maintain. Let's go over what they are.

A `union` is a special class type that can only hold one of its members at a time. It's similar to a `struct` declaration. Take the following sample code from [cppreference](https://en.cppreference.com/w/cpp/language/union). I've added some of my thoughts.
{% highlight c++ %}
union S {
   std::string str;
   std::vector<int> vec;
   ~S() {} // needs to know which member is active, only possible in union-like class
};  // the whole union occupies max(sizeof(string), sizeof(vector))
int main()
{
    S s = {"Hello world"};
    /*
    Okay, so we can set this choice type to a string
    Actually, this just sets the value to the first type. Looks like order matters.
    At this point, reading from s.vec is undefined behavior
    Shouldn't reading from s.vec throw an error or something?
    */
    std::cout << "s.str = " << s.str << '\n';
    s.str.~basic_string();  // uhm, destroying the string with its literal destructor?
    /*
    s = { std::vector<int>{12,34} };
    We can't this op, which is pretty unintuitive
    since we could handle the string case.
    */
    new (&s.vec) std::vector<int>;
    // now, s.vec is the active member of the union
    s.vec.push_back(10);
    std::cout << s.vec.size() << '\n';
    s.vec.~vector(); // another destructor!
}
{% endhighlight %}
To me, it makes little sense for the developer using union to control so much of the nitty gritty. Huge points against using this at all are:
 - There's no way to check the active type, making the program keep state of the union separately,
 - The developer must explicitly call the constructors and destructor of the contained objects to manage internal state.
 - There's no consistency in setting the value

Limitations, described by cppreference:
 - no virtual functions allowed
 - cannot have base classes
 - cannot be used as a base class
 - cannot have non-static data members of reference types
Union just seems like a super clunky, crude implementation of a lower-level type, but finally C++17 improves on this: Introducing the new and improved `std::variant`!

### std::variant
Unrelated to statistical variance mentioned in my [deleted] previous post, the `std::variant` is a new feature in the C++17 standard library. It's similar to the existing `boost::variant`. We can define union or choice types with a more comprehensive solution.

Let's see if this is something that sucks a little less, shall we?

{% highlight cpp %}
int main() {
    std::variant<std::vector<int>, std::string> mVariant;
    mVariant = "hello world";  // We can match types without it being the first one!
    std::cout << mVariant.index() << std::endl;  // "1", the index in the template
    mVariant = std::vector{1, 2, 3};
    /* We can change the value without manually calling the destructor!
    Setting the value makes sense with the assignment operator */
    mVariant = "this is so much better already";

    /* index() does a good enough job, but there's also
    other ways to satiate your value getting needs 
        std::get() could throw std::bad_variant_access, while
        std::get_if() does not throw */
    auto strPtr = std::get<std::string>(mVariant);
    std::cout << *strPtr << std::endl;
    auto strPtr = std::get_if<std::string>(mVariant);
    if (strPtr) {
        std::cout << *strPtr << std::endl;
    }
    /* We don't have to get the value to check the value.
    std also has holds_alternative: */
    if (std::holds_alternative<std::string>(mVariant)) {
        std::cout << "variant holds a string" << std::endl;
    }

    /* We can also change the values other ways: */
    mVariant.emplace<1>(std::string("emplace me"));
    
    /* Because get() returns a reference, we can do things like */
    std::get<std::string>(mVariant) += " append me";
}
{% endhighlight %}


I'd say that this is a much more mature and featured implementation of the choice type wanted.

There are a few great things about `std::variant`:

If you haven't noticed, all the getters are type safe.
 - You can figure out the current type with `holds_alternative()` and `index()`
 - You don't have to manually call constructors/destructors, even on non-trival types.
 - There's no extra memory allocation besides the one for std::variant itself, which can stay on the stack; no heap allocations except for the held object itself.

### std::visit
`std::visit` is a function that applies a function, called a "Visitor", on a `std::variant`. Visitors are used to

It's easier to see in an example than it is to explain in words.
{% highlight cpp %}
int main() {
    auto PrintVisitor = [](const auto& type) { std:: cout << type << " visited"; };
    std::variant<int, double> mVariant { 1 };
    std::visit(PrintVisitor, mVariant);  // prints "1 visited"
    /* We can selectively modify a variant based on its type through a struct */
    struct MathVisitor {
    	/* if int value, multiply by 2. if float, multiply by 1.5 */
        void operator()(int& i) const {
            i *= 2;
        }
        void operator()(float& f) const {
            f *= 1.5f;
        }
    }
    std::visit(MathVisitor(), mVariant);  // mVariant holds an int value of 2
    std::visit(PrintVisitor, mVariant);  // prints "2 visited"
{% endhighlight %}
There's only a few places `std::variant` actually comes into use that I can think of, so it's not the most useful thing in the world. Only a few niche circumstances come to mind:

 - Error handling: returning either the success value or an error.
 - Using them to handle an object that might be defined by a string name or int id
 - ???
I have some issues with the visitor function. It still feels a little clunky and verbose.  There's still some refinement to be done here, but overall, I think `std::variant` and friends are a great replacement for `union`.



